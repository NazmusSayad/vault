import { BetterScrollAreaFaded } from '@/components/ui/better-scroll-area'
import { Wrapper } from '@/components/wrapper'
import { VaultSecretForm } from './components/vault-secret-form'
import { useVaultContext } from './contexts/vault-context'

export function VaultUnauthedPage() {
  const { id, setSecret } = useVaultContext()

  return (
    <BetterScrollAreaFaded>
      <div className="flex size-full min-h-[90vh] items-center justify-center">
        <Wrapper className="w-full" maxWidth="24rem">
          <VaultSecretForm vaultId={id} confirmSecret={setSecret} />
        </Wrapper>
      </div>
    </BetterScrollAreaFaded>
  )
}
