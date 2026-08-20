import type { ReactNode } from 'react';
import type { PaymentMethod, StoreSettingsPublic } from '@/types';

interface PaymentMethodSelectorProps {
  storeSettings: StoreSettingsPublic;
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

/**
 * COD has NO entry in StoreSettings at all (no isActive toggle exists for it in the schema)
 * — it's unconditionally available, matching the "COD badge" trust signal. JazzCash/
 * EasyPaisa/BankTransfer only render if StoreSettings returned a non-null object for them —
 * the exact same "null means don't advertise this option" pattern already used in
 * Footer.tsx's payment badges.
 */
export function PaymentMethodSelector({
  storeSettings,
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <PaymentOption
        title="Cash on Delivery"
        description="Pay in cash when your order arrives."
        selected={value === 'COD'}
        onSelect={() => onChange('COD')}
      />

      {storeSettings.jazzCash && (
        <PaymentOption
          title="JazzCash"
          description="Manual transfer — send payment, then share a screenshot on WhatsApp."
          selected={value === 'JazzCash'}
          onSelect={() => onChange('JazzCash')}
        >
          <AccountDetails
            rows={[
              ['Account title', storeSettings.jazzCash.accountTitle],
              ['Account number', storeSettings.jazzCash.accountNumber],
            ]}
            instructions={storeSettings.jazzCash.instructions}
          />
        </PaymentOption>
      )}

      {storeSettings.easyPaisa && (
        <PaymentOption
          title="EasyPaisa"
          description="Manual transfer — send payment, then share a screenshot on WhatsApp."
          selected={value === 'EasyPaisa'}
          onSelect={() => onChange('EasyPaisa')}
        >
          <AccountDetails
            rows={[
              ['Account title', storeSettings.easyPaisa.accountTitle],
              ['Account number', storeSettings.easyPaisa.accountNumber],
            ]}
            instructions={storeSettings.easyPaisa.instructions}
          />
        </PaymentOption>
      )}

      {storeSettings.bankTransfer && (
        <PaymentOption
          title={storeSettings.bankTransfer.bankName}
          description="Manual bank transfer — send payment, then share a screenshot on WhatsApp."
          selected={value === 'BankTransfer'}
          onSelect={() => onChange('BankTransfer')}
        >
          <AccountDetails
            rows={[
              ['Bank', storeSettings.bankTransfer.bankName],
              ['Account title', storeSettings.bankTransfer.accountTitle],
              ['Account number', storeSettings.bankTransfer.accountNumber],
              ...(storeSettings.bankTransfer.iban
                ? ([['IBAN', storeSettings.bankTransfer.iban]] as [string, string][])
                : []),
            ]}
            instructions={storeSettings.bankTransfer.instructions}
          />
        </PaymentOption>
      )}
    </div>
  );
}

interface PaymentOptionProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  children?: ReactNode;
}

function PaymentOption({ title, description, selected, onSelect, children }: PaymentOptionProps) {
  return (
    <div
      className={`rounded-md border p-4 transition-colors ${
        selected ? 'border-primary bg-primary/5' : 'border-border'
      }`}
    >
      <button type="button" onClick={onSelect} className="flex w-full items-start gap-3 text-left">
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? 'border-primary' : 'border-border'
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
        </span>
        <span>
          <span className="block text-sm font-medium text-foreground">{title}</span>
          <span className="block text-xs text-muted-foreground">{description}</span>
        </span>
      </button>
      {selected && children && <div className="mt-3 pl-7">{children}</div>}
    </div>
  );
}

function AccountDetails({
  rows,
  instructions,
}: {
  rows: [string, string][];
  instructions: string | null;
}) {
  return (
    <div className="rounded-md bg-secondary p-3 text-xs">
      {rows.map(([label, val]) => (
        <div key={label} className="flex justify-between py-0.5">
          <span className="text-muted-foreground">{label}</span>
          <span className="font-medium text-foreground">{val}</span>
        </div>
      ))}
      {instructions && <p className="mt-2 text-muted-foreground">{instructions}</p>}
    </div>
  );
}