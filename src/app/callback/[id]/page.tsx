import { redirect } from "next/navigation";

export default async function CallbackIdPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params;

    // If we have an ID in the path, verify it looks like an order ID?
    // Start with strict redirect.
    if (id) {
        redirect(`/order/${id}`);
    }

    redirect('/');
}
