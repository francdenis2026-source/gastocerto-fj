import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/kids/extrato')({
  beforeLoad: () => {
    throw new Response(null, { status: 404 });
  },
  component: () => null
})
