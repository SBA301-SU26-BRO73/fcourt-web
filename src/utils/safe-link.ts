/** Only app routes: a link coming from the server must never send the user to another site. */
export function safeInternalLink(link: string | null): string | null {
  return link && link.startsWith('/') && !link.startsWith('//') ? link : null
}
