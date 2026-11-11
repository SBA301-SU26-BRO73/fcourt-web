import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { isPdfUrl, ViewerButton, ZoomableImage } from './image-viewer'

afterEach(cleanup)

const gallery = [
  { url: 'https://cdn/a.jpg', alt: 'A' },
  { url: 'https://cdn/b.jpg', alt: 'B' },
  { url: 'https://cdn/c.pdf?X-Amz-Signature=1', alt: 'C' },
]

describe('isPdfUrl', () => {
  it('looks at the path, not the presigned query string', () => {
    expect(isPdfUrl('https://s3/owner-documents/x.pdf?X-Amz-Signature=abc')).toBe(true)
    expect(isPdfUrl('https://s3/owner-documents/x.jpg?name=a.pdf')).toBe(false)
  })
})

describe('image viewer', () => {
  it('opens in the page, steps through the gallery and closes on Esc without opening a tab', () => {
    render(<ZoomableImage src={gallery[0].url} alt="A" gallery={gallery} index={0} />)
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Xem ảnh: A' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(screen.getByText('1 / 3')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Ảnh sau' }))
    expect(screen.getByText('2 / 3')).toBeTruthy()
    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(document.querySelector('iframe')?.getAttribute('src')).toBe(gallery[2].url)

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closes on backdrop click but not on a click inside the toolbar', () => {
    render(<ViewerButton url="https://cdn/a.png" alt="Biên lai">Xem</ViewerButton>)
    fireEvent.click(screen.getByRole('button', { name: 'Biên lai' }))
    const dialog = screen.getByRole('dialog')
    fireEvent.click(screen.getByRole('button', { name: 'Phóng to' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.click(dialog)
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
