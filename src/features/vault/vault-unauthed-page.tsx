import { VaultSecretForm } from './components/vault-secret-form'
import { useVaultContext } from './contexts/vault-context'

export function VaultUnauthedPage() {
  const { id, setSecret } = useVaultContext()

  return (
    <div className="absolute inset-0 flex size-full items-center justify-center">
      <div className="w-full max-w-md">
        <VaultSecretForm vaultId={id} confirmSecret={setSecret} />
      </div>
    </div>
  )
}
