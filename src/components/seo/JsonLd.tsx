interface JsonLdProps {
  data: Record<string, unknown> | Record<string, unknown>[];
}

/** Renders one JSON-LD <script>. "<" is escaped so product text can never close the tag. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
