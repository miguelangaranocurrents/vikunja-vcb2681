import type {Fragment, Node as ProseMirrorNode, Slice} from '@tiptap/pm/model'

/**
 * Plain text for copied editor content. ProseMirror's default joins blocks with blank
 * lines and drops list markers, so a copied bullet list would paste back as loose
 * lines. This keeps the list structure as markdown-style markers.
 */
export function serializeSliceToText(slice: Slice): string {
	return blockLines(slice.content, '').join('\n')
}

function blockLines(fragment: Fragment, indent: string): string[] {
	const lines: string[] = []

	fragment.forEach((node: ProseMirrorNode) => {
		const name = node.type.name

		if (name === 'bulletList' || name === 'taskList' || name === 'orderedList') {
			let number = 1
			node.forEach((item: ProseMirrorNode) => {
				const marker = name === 'orderedList' ? `${number++}. ` : '- '
				const [first = '', ...rest] = blockLines(item.content, '')
				lines.push(indent + marker + first)
				const continuation = indent + ' '.repeat(marker.length)
				rest.forEach(line => lines.push(line === '' ? '' : continuation + line))
			})
			return
		}

		if (node.isTextblock) {
			lines.push(indent + node.textContent)
			return
		}

		if (node.isBlock && node.childCount > 0) {
			lines.push(...blockLines(node.content, indent))
			return
		}

		if (node.isBlock) {
			lines.push('')
		}
	})

	return lines
}
