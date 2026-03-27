'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TesteSupabasePage() {
  const [loading, setLoading] = useState(true)
  const [dataText, setDataText] = useState('')
  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    async function testConnection() {
      const { data, error } = await supabase.from('orders').select('*')

      setDataText(JSON.stringify(data, null, 2))
      setErrorText(error ? JSON.stringify(error, null, 2) : 'null')
      setLoading(false)
    }

    testConnection()
  }, [])

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="mb-6 text-3xl font-bold">Teste Supabase</h1>

      {loading ? (
        <p className="text-lg">Testando conexão...</p>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl bg-zinc-900 p-4">
            <h2 className="mb-2 text-xl font-semibold">DATA</h2>
            <pre className="whitespace-pre-wrap break-words text-sm">
              {dataText}
            </pre>
          </div>

          <div className="rounded-xl bg-zinc-900 p-4">
            <h2 className="mb-2 text-xl font-semibold">ERROR</h2>
            <pre className="whitespace-pre-wrap break-words text-sm">
              {errorText}
            </pre>
          </div>
        </div>
      )}
    </main>
  )
}