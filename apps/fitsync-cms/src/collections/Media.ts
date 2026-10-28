import type { CollectionConfig } from 'payload'
import { ValidationError } from 'payload'

import { coerceNumericRelations, toNumericRelationId } from '../access/relationIds'
import { isSuperUser } from '../access/isSuper'
import { userRole } from '../access/roles'
import { linkedProfessionalIds, linkedStudentIds } from '../access/links'

function actorId(req: { user?: { id?: unknown } | null }): number | null {
  return toNumericRelationId(req.user?.id)
}

async function mediaOwnerAccess({ req }: { req: Parameters<typeof linkedStudentIds>[0] }) {
  if (isSuperUser(req)) return true
  const id = actorId(req)
  if (id === null) return false
  const or: { owner: { equals: number } | { in: number[] } }[] = [{ owner: { equals: id } }]
  const role = userRole(req)
  const linkedIds =
    role === 'personal' || role === 'nutritionist'
      ? await linkedStudentIds(req, { status: 'active' })
      : role === 'student'
        ? await linkedProfessionalIds(req)
        : []
  const linked = linkedIds
    .map((value) => toNumericRelationId(value))
    .filter((value): value is number => value !== null)
  if (linked.length > 0) or.push({ owner: { in: linked } })
  return { or }
}

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: mediaOwnerAccess,
    create: ({ req }) => isSuperUser(req) || Boolean(req.user),
    update: ({ req }) => {
      if (isSuperUser(req)) return true
      const id = actorId(req)
      if (id === null) return false
      return { owner: { equals: id } }
    },
    delete: ({ req }) => {
      if (isSuperUser(req)) return true
      const id = actorId(req)
      if (id === null) return false
      return { owner: { equals: id } }
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, operation, req, collection }) => {
        if (!data) return data
        const candidates = [req.file?.size, req.file?.data?.length, data.filesize]
        const size = candidates.reduce<number>(
          (max, value) => (typeof value === 'number' && value > max ? value : max),
          0,
        )
        if (size > 2_000_000) {
          throw new ValidationError({
            collection: collection?.slug,
            errors: [{ path: 'file', message: 'A foto deve ter no máximo 2 MB.' }],
          })
        }
        if (operation === 'create' && req.user) {
          const actorId = toNumericRelationId(req.user.id)
          if (actorId !== null) data.owner = actorId
        }
        coerceNumericRelations(data, ['owner'])
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      index: true,
      admin: { readOnly: true },
    },
  ],
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },
}
