'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WinnerVerification } from '@/types/database'
import { Upload, FileImage, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface WinnerProofUploadProps {
  verification: WinnerVerification
  onUploadComplete?: () => void
}

export default function WinnerProofUpload({ verification, onUploadComplete }: WinnerProofUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload an image file (PNG, JPG)')
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileExt = file.name.split('.').pop()
      const filePath = `${user.id}/${verification.id}.${fileExt}`

      // 1. Upload file to Supabase storage mapping to winner-proofs bucket
      const { error: uploadError } = await supabase.storage
        .from('winner-proofs')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // 2. Update verification record
      const { error: updateError } = await supabase
        .from('winner_verifications')
        .update({ 
          proof_url: filePath,
          status: 'pending' // Reset to pending if re-uploading
        })
        .eq('id', verification.id)

      if (updateError) throw updateError

      setFile(null)
      if (onUploadComplete) onUploadComplete()
      alert('Proof uploaded successfully! Admin will review shortly.')
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload proof')
    } finally {
      setUploading(false)
    }
  }

  const getPublicUrl = (path: string) => {
    return supabase.storage.from('winner-proofs').getPublicUrl(path).data.publicUrl
  }

  return (
    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-white">Verification Status</h4>
          <p className="text-sm text-slate-400">
            {verification.status === 'pending' && 'Awaiting admin review.'}
            {verification.status === 'approved' && 'Proof approved. Payout is being processed.'}
            {verification.status === 'rejected' && 'Proof rejected. Please upload again.'}
          </p>
        </div>
        <StatusBadge status={verification.status} />
      </div>

      {verification.admin_notes && verification.status === 'rejected' && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm mb-4">
          <strong>Admin Notes:</strong> {verification.admin_notes}
        </div>
      )}

      {verification.proof_url ? (
        <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700">
          <div className="flex items-center text-emerald-400 text-sm">
            <FileImage className="w-5 h-5 mr-2" />
            Proof Uploaded
          </div>
          <a
            href={getPublicUrl(verification.proof_url)}
            target="_blank"
            rel="noreferrer"
            className="text-xs flex items-center text-slate-400 hover:text-white transition-colors"
          >
            View <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      ) : (
        <div className="text-sm text-amber-500 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
          Please upload a screenshot of your scores to claim your winnings.
        </div>
      )}

      {/* Allow upload if no proof or if rejected */}
      {(!verification.proof_url || verification.status === 'rejected') && (
        <div className="mt-4 space-y-3">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-800 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-slate-400" />
              <p className="mb-2 text-sm text-slate-400">
                <span className="font-semibold text-emerald-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-slate-500">PNG or JPG (MAX. 5MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
          </label>
          
          {file && (
            <div className="flex items-center justify-between text-sm text-slate-300 bg-slate-900 p-2 rounded">
              <span className="truncate max-w-[200px]">{file.name}</span>
              <button 
                onClick={handleUpload} 
                disabled={uploading}
                className="btn-primary py-1.5 px-4 text-xs flex items-center"
              >
                {uploading ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null}
                {uploading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          )}
          
          {error && <p className="text-sm text-rose-400">{error}</p>}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'approved') return <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>
  if (status === 'rejected') return <span className="flex items-center text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full"><XCircle className="w-3 h-3 mr-1" /> Rejected</span>
  return <span className="flex items-center text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full animate-pulse-soft">Pending</span>
}
