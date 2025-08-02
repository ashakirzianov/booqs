'use client'

import { useState } from 'react'
import { PasskeyData } from '@/data/auth'
import { PasskeyIcon, TrashIcon } from '@/components/Icons'
import { LightButton, IconButton } from '@/components/Buttons'
import { usePasskeys } from '@/application/passkeys'

export function PasskeySection({ initialPasskeys }: { initialPasskeys: PasskeyData[] }) {
    const [passkeys, setPasskeys] = useState(initialPasskeys)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isAddingPasskey, setIsAddingPasskey] = useState(false)
    const { registerPasskey, deletePasskey } = usePasskeys()

    const handleDeletePasskey = async (id: string) => {
        setIsDeleting(id)
        try {
            const result = await deletePasskey(id)
            if (result.success && result.passkeys) {
                setPasskeys(result.passkeys)
            } else {
                console.error('Failed to delete passkey:', result.error)
            }
        } catch (error) {
            console.error('Failed to delete passkey:', error)
        } finally {
            setIsDeleting(null)
        }
    }

    const handleAddPasskey = async () => {
        setIsAddingPasskey(true)
        const result = await registerPasskey()
        if (!result.success) {
            console.error('Failed to add passkey:', result.error)
            setIsAddingPasskey(false)
            return
        }
        if (result.passkeys) {
            setPasskeys(result.passkeys)
        }
        setIsAddingPasskey(false)
    }

    return (
        <div className="bg-background border border-dimmed rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-primary">Passkeys</h2>
                <LightButton onClick={handleAddPasskey} disabled={isAddingPasskey}>
                    <div className="w-4 h-4">
                        <PasskeyIcon />
                    </div>
                    {isAddingPasskey ? 'Adding...' : 'Add Passkey'}
                </LightButton>
            </div>

            <p className="text-sm text-dimmed mb-4">
                Passkeys provide secure, passwordless authentication using your device&apos;s biometric features or PIN.
            </p>

            {passkeys.length === 0 ? (
                <div className="text-center py-8 text-dimmed">
                    <div className="w-12 h-12 mx-auto mb-4 opacity-50">
                        <PasskeyIcon />
                    </div>
                    <p>No passkeys configured</p>
                    <p className="text-sm">Add a passkey for secure, passwordless sign-in</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {passkeys.map((passkey) => (
                        <div key={passkey.id} className="flex items-center justify-between p-3 border border-dimmed rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-6 h-6 text-action">
                                    <PasskeyIcon />
                                </div>
                                <div>
                                    <p className="font-medium text-primary">
                                        {passkey.label || 'Unnamed Passkey'}
                                    </p>
                                    <p className="text-sm text-dimmed">
                                        Added {formatDate(passkey.createdAt)}
                                        {passkey.ipAddress && (
                                            <span className="ml-2">• IP: {passkey.ipAddress}</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <IconButton
                                onClick={() => handleDeletePasskey(passkey.id)}
                                disabled={isDeleting === passkey.id}
                                variant="danger"
                                title="Delete passkey"
                            >
                                <div className="w-4 h-4">
                                    {isDeleting === passkey.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-alert"></div>
                                    ) : (
                                        <TrashIcon />
                                    )}
                                </div>
                            </IconButton>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}