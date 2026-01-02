import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function CallbackPage() {
    // Read pending order from cookie (set during checkout)
    const cookieStore = await cookies();
    const orderId = cookieStore.get('ldc_pending_order')?.value;

    if (orderId) {
        redirect(`/order/${orderId}`);
    }

    // If no cookie found, go to orders list
    redirect('/orders');
}
