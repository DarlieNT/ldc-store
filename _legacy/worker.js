/**
 * Linux DO Credit Virtual Goods Platform
 * Based on Cloudflare Worker + D1 Database
 * Supports EasyPay Protocol + Automatic Delivery
 */

// ==================== Configuration ====================
let CONFIG = null;

const DEFAULT_CONFIG = {
    // Linux DO Credit Merchant Config (Secrets loaded from env)
    MERCHANT_ID: '',
    MERCHANT_KEY: '',

    // Admin Config


    // Payment Gateway
    PAY_URL: 'https://credit.linux.do/epay/pay/submit.php',
    REFUND_URL: 'https://credit.linux.do/epay/api.php',

    // Site Config
    SITE_NAME: 'LDC Virtual Goods Shop',
    SITE_DESCRIPTION: 'High-quality virtual goods, instant delivery',
    SITE_FOOTER_LINK: 'https://chatgpt.org.uk',

    // Currency
    CURRENCY: 'credit',  // Linux DO Credit

    // OAUTH
    OAUTH: {
        CLIENT_ID: '',
        CLIENT_SECRET: '',
        REDIRECT_URI: 'https://ldc.chatgpt.org.uk/authcallback',
        AUTH_URL: 'https://connect.linux.do/oauth2/authorize',
        TOKEN_URL: 'https://connect.linux.do/oauth2/token',
        USER_URL: 'https://connect.linux.do/api/user',
    },
    // Admin Usernames (No passwords anymore!)
    ADMIN_USERS: ['chatgpt'], // Default, override with env.ADMIN_USERS

    COOKIE_SESSION: 'ldc_session',
};

// ==================== Utilities ====================

function generateOrderId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ORD${timestamp}${random}`.toUpperCase();
}

async function md5(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('MD5', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function generateSign(params, merchantKey) {
    const filtered = Object.entries(params)
        .filter(([key, value]) => value !== '' && value !== null && value !== undefined && key !== 'sign' && key !== 'sign_type')
        .sort(([a], [b]) => a.localeCompare(b));
    const str = filtered.map(([key, value]) => `${key}=${value}`).join('&');
    return await md5(str + merchantKey);
}

async function verifySign(params, merchantKey) {
    const receivedSign = params.sign;
    const calculatedSign = await generateSign(params, merchantKey);
    return receivedSign === calculatedSign;
}

// ==================== HTML Templates ====================

// SVG Logo (Blue Diamond)
// We will use Lucide icons mostly, but keep this for brand if needed, or replace with Lucide 'Gem'
const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" class="stroke-primary" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`;
const FAVICON_SVG = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z%22/><path d=%22M3 6h18%22/><path d=%22M16 10a4 4 0 0 1-8 0%22/></svg>`;

function getCommonHead(title) {
    return `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="icon" href="${FAVICON_SVG}">
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      :root { font-family: 'Inter', sans-serif; }
      @layer base {
        :root {
          --background: 0 0% 100%; --foreground: 240 10% 3.9%;
          --card: 0 0% 100%; --card-foreground: 240 10% 3.9%;
          --popover: 0 0% 100%; --popover-foreground: 240 10% 3.9%;
          --primary: 240 5.9% 10%; --primary-foreground: 0 0% 98%;
          --secondary: 240 4.8% 95.9%; --secondary-foreground: 240 5.9% 10%;
          --muted: 240 4.8% 95.9%; --muted-foreground: 240 3.8% 46.1%;
          --accent: 240 4.8% 95.9%; --accent-foreground: 240 5.9% 10%;
          --destructive: 0 84.2% 60.2%; --destructive-foreground: 0 0% 98%;
          --border: 240 5.9% 90%; --input: 240 5.9% 90%; --ring: 240 10% 3.9%;
          --radius: 0.5rem;
        }
      }
      /* Custom scrollbar for better aesthetics */
      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }
      ::-webkit-scrollbar-thumb:hover { background: hsl(var(--secondary)); }
    </style>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          container: { center: true, padding: "2rem", screens: { "2xl": "1400px" } },
          extend: {
            colors: {
              border: "hsl(var(--border))", input: "hsl(var(--input))", ring: "hsl(var(--ring))", background: "hsl(var(--background))", foreground: "hsl(var(--foreground))",
              primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
              secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
              destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
              muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
              accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
              popover: { DEFAULT: "hsl(var(--popover))", foreground: "hsl(var(--popover-foreground))" },
              card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
            },
            borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
          },
        },
      }
      window.addEventListener('load', () => lucide.createIcons());
    </script>
    `;
}

function renderHeader(user = null) {
    const navRight = user
        ? `<div class="flex items-center gap-4">
             <div class="flex items-center gap-2">
                <img src="${user.avatar_url}" class="w-8 h-8 rounded-full border border-border">
                <span class="text-sm font-medium hidden sm:inline-block">${user.name || user.username}</span>
             </div>
             <a href="/auth/logout" class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Logout</a>
           </div>`
        : `<a href="/auth/login" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
            Login with Linux DO
           </a>`;

    const adminLink = (user && CONFIG.ADMIN_USERS.map(u => u.toLowerCase()).includes(user.username.toLowerCase()))
        ? `<a href="/admin" class="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Admin</a>` : '';

    return `<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div class="container flex h-16 items-center justify-between">
            <div class="flex items-center gap-6">
                <a href="/" class="flex items-center space-x-2">
                    ${LOGO_SVG}
                    <span class="hidden font-bold sm:inline-block text-lg">${CONFIG.SITE_NAME}</span>
                </a>
                <nav class="flex items-center gap-6 text-sm">
                    <a href="/" class="transition-colors hover:text-foreground/80 text-foreground/60">Store</a>
                    <a href="/query" class="transition-colors hover:text-foreground/80 text-foreground/60">History</a>
                    ${adminLink}
                </nav>
            </div>
            ${navRight}
        </div>
    </header>`;
}

function renderFooter() {
    return `<footer class="py-6 md:px-8 md:py-0 border-t mt-auto text-center">
         <div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p class="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
              Powered by <a href="${CONFIG.SITE_FOOTER_LINK}" target="_blank" class="font-medium underline underline-offset-4">chatgpt.org.uk</a>
            </p>
            <p class="text-xs text-muted-foreground">Virtual Goods Only. Not an official Linux Do service.</p>
         </div>
      </footer>`;
}

function renderHomePage(products, user = null) {
    return `<!DOCTYPE html><html class="h-full"><head>${getCommonHead(CONFIG.SITE_NAME)}</head>
    <body class="flex min-h-full flex-col bg-background">
      ${renderHeader(user)}
      <main class="flex-1">
        <div class="container py-8">
            <section class="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
                <h1 class="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
                    Virtual Goods Shop
                </h1>
                <p class="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
                    ${CONFIG.SITE_DESCRIPTION}
                </p>
            </section>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              ${products.map(p => `
                <div class="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                  <div class="p-6 flex flex-col items-center justify-center bg-muted/20 border-b aspect-[4/3]">
                      <img src="${p.image}" alt="${p.name}" class="h-24 w-24 object-contain drop-shadow-md">
                  </div>
                  <div class="p-6 space-y-3">
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="font-semibold leading-none tracking-tight text-lg">${p.name}</h3>
                            ${p.category && p.category !== 'general' ? `<span class="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold text-muted-foreground mt-1">${p.category}</span>` : ''}
                        </div>
                        <div class="text-sm font-medium bg-secondary text-secondary-foreground px-2.5 py-0.5 rounded-full">
                            ${p.price} pts
                        </div>
                    </div>
                    <p class="text-sm text-muted-foreground line-clamp-2 h-10">${p.description}</p>
                    
                    <div class="flex items-center justify-between text-xs text-muted-foreground mt-4 pt-4 border-t">
                       <span>Sold: ${p.sold}</span>
                       <span class="${p.stock < 1 ? 'text-destructive font-medium' : ''}">Stock: ${p.stock}</span>
                    </div>

                    <a href="/buy/${p.id}" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${p.stock > 0 ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50 pointer-events-none'} h-10 px-4 py-2 w-full mt-2">
                        ${p.stock > 0 ? 'Buy Now' : 'Sold Out'}
                    </a>
                  </div>
                </div>`).join('')}
            </div>
        </div>
      </main>
      ${renderFooter()}
    </body></html>`;
}

function renderBuyPage(product, user = null) {
    return `<!DOCTYPE html><html class="h-full"><head>${getCommonHead('Buy ' + product.name)}</head>
    <body class="flex min-h-full flex-col bg-background">
      ${renderHeader(user)}
      <main class="flex-1 container flex items-center justify-center py-12">
        <div class="rounded-xl border bg-card text-card-foreground shadow-sm w-full max-w-lg">
           <div class="flex flex-col space-y-1.5 p-6">
              <a href="/" class="text-sm text-muted-foreground hover:text-primary mb-2 flex items-center gap-1">&larr; Back to Store</a>
              <h3 class="font-semibold tracking-tight text-2xl">Confirm Order</h3>
              <p class="text-sm text-muted-foreground">You are about to purchase <strong>${product.name}</strong></p>
           </div>
           
           <div class="p-6 pt-0 space-y-4">
               <div class="rounded-lg border bg-muted/40 p-4">
                  <p class="text-sm font-medium leading-none mb-2">Item Details</p>
                  <p class="text-sm text-muted-foreground">${product.description}</p>
                  <div class="mt-4 flex items-center justify-between">
                     <span class="font-bold text-lg">${product.price} pts</span>
                     <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">Digital Item</span>
                  </div>
               </div>
               
               ${!user
            ? `<div class="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
                      Login is required to purchase this item.
                   </div>
                   <a href="/auth/login" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                     Login with Linux DO
                   </a>`
            : `<form action="/order/create" method="POST">
                     <input type="hidden" name="product_id" value="${product.id}">
                     <input type="hidden" name="csrf_token" value="${user.csrf_token || ''}">
                     ${product.stock > 0
                ? `<button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                        Pay ${product.price} Credit
                       </button>`
                : `<button disabled class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-muted text-muted-foreground opacity-50 cursor-not-allowed h-10 px-4 py-2 w-full">
                        Sold Out
                       </button>`
            }
                   </form>`
        }
           </div>
        </div>
      </main>
      ${renderFooter()}
    </body></html>`;
}

function renderOrderPage(order, showKey = false, user = null) {
    const statusColor = order.status === 'delivered' ? 'text-green-600 bg-green-50' : order.status === 'paid' ? 'text-orange-600 bg-orange-50' : 'text-gray-600 bg-gray-50';
    const statusIcon = order.status === 'delivered' ? '<i data-lucide="check-circle" class="w-12 h-12 text-green-600"></i>' : order.status === 'paid' ? '<i data-lucide="clock" class="w-12 h-12 text-orange-600"></i>' : '<i data-lucide="package" class="w-12 h-12 text-gray-400"></i>';

    return `<!DOCTYPE html><html class="h-full"><head>${getCommonHead('Order #' + order.order_id)}</head>
    <body class="flex min-h-full flex-col bg-background">
       ${renderHeader(user)}
       <main class="flex-1 container flex items-center justify-center py-12">
          <div class="rounded-xl border bg-card text-card-foreground shadow-sm w-full max-w-xl text-center p-8">
             <div class="flex justify-center mb-6">${statusIcon}</div>
             <h1 class="text-2xl font-bold tracking-tight mb-2">Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</h1>
             <p class="text-muted-foreground mb-6 font-mono text-sm">${order.order_id}</p>
             
             ${order.card_key ? (showKey ? `
                 <div class="relative group cursor-pointer" onclick="navigator.clipboard.writeText('${order.card_key}').then(()=>alert('Copied!'))">
                    <div class="rounded-lg border bg-muted p-6 font-mono text-lg break-all select-all">
                        ${order.card_key}
                    </div>
                    <div class="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <span class="bg-background text-foreground text-xs font-medium px-2 py-1 rounded shadow">Click to Copy</span>
                    </div>
                 </div>
                 <p class="text-xs text-muted-foreground mt-2">Click the box to copy your key</p>
                 ` : `<div class="rounded-lg border border-dashed p-8 bg-muted/20">
                        <i data-lucide="lock" class="w-6 h-6 mx-auto text-muted-foreground mb-2"></i>
                        <p class="text-sm font-medium">Card Key Hidden</p>
                        <p class="text-xs text-muted-foreground mt-1">Open this link in the purchasing browser to view.</p>
                      </div>`) : ''}
                      
             <div class="mt-8 pt-6 border-t flex justify-center">
                <a href="/" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-8 py-2">
                    Back to Shop
                </a>
             </div>
          </div>
       </main>
       ${renderFooter()}
    </body></html>`;
}

// --- Admin Views (Tailwind) ---

function renderAdminLogin() {
    return `<!DOCTYPE html><html class="h-full"><head>${getCommonHead('Admin Login')}</head>
    <body class="flex min-h-full items-center justify-center bg-background">
      <div class="rounded-xl border bg-card text-card-foreground shadow-sm w-full max-w-sm">
        <div class="flex flex-col space-y-1.5 p-6">
            <h3 class="font-semibold tracking-tight text-2xl text-center">Admin Login</h3>
            <p class="text-sm text-muted-foreground text-center">Enter your access credentials</p>
        </div>
        <div class="p-6 pt-0">
             <form action="/admin/login" method="POST" class="space-y-4">
                 <input type="password" name="password" placeholder="Password" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                 <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                    Login
                 </button>
             </form>
        </div>
      </div>
    </body></html>`;
}

function renderAdminLayout(content, activeTab, user) {
    return `<!DOCTYPE html><html class="h-full"><head>${getCommonHead('Admin Dashboard')}</head>
    <body class="flex min-h-full flex-col bg-background">
      <header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
         <div class="container flex h-14 items-center">
            <div class="mr-4 flex">
               <a href="/" class="mr-6 flex items-center space-x-2 font-bold hover:text-primary transition-colors">
                  ${LOGO_SVG} <span class="hidden sm:inline-block">Admin</span>
               </a>
               <nav class="flex items-center space-x-6 text-sm font-medium">
                  <a href="/admin" class="transition-colors hover:text-foreground/80 ${activeTab === 'products' ? 'text-foreground' : 'text-foreground/60'}">Products</a>
                  <a href="/admin/orders" class="transition-colors hover:text-foreground/80 ${activeTab === 'orders' ? 'text-foreground' : 'text-foreground/60'}">Orders</a>
               </nav>
            </div>
            <div class="ml-auto flex items-center space-x-4">
                <a href="/" target="_blank" class="text-sm text-muted-foreground hover:text-primary">View Site &nearr;</a>
                <form action="/auth/logout" method="POST">
                   <button class="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors">Logout</button>
                </form>
            </div>
         </div>
      </header>
      <main class="flex-1 space-y-4 p-8 pt-6">
         ${content}
      </main>
    </body></html>`;
}

function renderAdminDashboardWithUser(products, user) {
    const tableRows = products.map(p => `
        <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
             <td class="p-4 align-middle font-medium">${p.id}</td>
             <td class="p-4 align-middle">${p.name}</td>
             <td class="p-4 align-middle">${p.price}</td>
             <td class="p-4 align-middle">
                <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${p.stock > 0 ? 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80'}">
                    ${p.stock}
                </span>
             </td>
             <td class="p-4 align-middle">
                <div class="flex items-center gap-2">
                    <a href="/admin/product/edit/${p.id}" title="Edit Product" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                        <i data-lucide="pencil" class="h-4 w-4"></i>
                    </a>
                    <a href="/admin/cards/list/${p.id}" title="Manage Stock" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                        <i data-lucide="package" class="h-4 w-4"></i>
                    </a>
                    <form action="/admin/product/delete/${p.id}" method="POST" onsubmit="return confirm('Delete this product and ALL its cards?');">
                       <input type="hidden" name="csrf_token" value="${user.csrf_token}">
                       <button title="Delete Product" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 w-8 p-0">
                           <i data-lucide="trash-2" class="h-4 w-4"></i>
                       </button>
                    </form>
                </div>
             </td>
        </tr>`).join('');

    const content = `
        <div class="flex items-center justify-between space-y-2">
            <h2 class="text-3xl font-bold tracking-tight">Products</h2>
            <div class="flex items-center space-x-2">
                <a href="/admin/product/new" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                   <i data-lucide="plus" class="mr-2 h-4 w-4"></i> New Product
                </a>
            </div>
        </div>
        <div class="rounded-md border bg-card">
            <div class="relative w-full overflow-auto">
                <table class="w-full caption-bottom text-sm">
                   <thead class="[&_tr]:border-b">
                      <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">ID</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Name</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Price</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Stock</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">Actions</th>
                      </tr>
                   </thead>
                   <tbody class="[&_tr:last-child]:border-0">
                      ${tableRows}
                   </tbody>
                </table>
            </div>
        </div>
    `;
    return renderAdminLayout(content, 'products', user);
}

function renderProductForm(product = {}, user) {
    const isEdit = !!product.id;
    const content = `
       <div class="flex items-center justify-center py-10">
          <div class="rounded-xl border bg-card text-card-foreground shadow-sm w-full max-w-lg">
             <div class="flex flex-col space-y-1.5 p-6">
                <h3 class="font-semibold tracking-tight text-2xl">${isEdit ? 'Edit' : 'New'} Product</h3>
                <p class="text-sm text-muted-foreground">Fill in the details below</p>
             </div>
             <div class="p-6 pt-0">
               <form action="/admin/product/save" method="POST" class="space-y-4">
                 <input type="hidden" name="csrf_token" value="${user.csrf_token}">
                 
                 <div class="space-y-2">
                    <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">ID (Unique)</label>
                    <input type="text" name="id" value="${product.id || ''}" ${isEdit ? 'readonly' : ''} required placeholder="prod_001" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                 </div>
                 
                 <div class="space-y-2">
                    <label class="text-sm font-medium leading-none">Name</label>
                    <input type="text" name="name" value="${product.name || ''}" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                 </div>
                 
                 <div class="space-y-2">
                    <label class="text-sm font-medium leading-none">Description</label>
                    <input type="text" name="description" value="${product.description || ''}" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                 </div>
                 
                 <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-sm font-medium leading-none">Price</label>
                        <input type="number" step="0.01" name="price" value="${product.price || ''}" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                    </div>
                    <div class="space-y-2">
                        <label class="text-sm font-medium leading-none">Category</label>
                        <input type="text" name="category" value="${product.category || 'general'}" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                    </div>
                 </div>
                 
                 <div class="space-y-2">
                    <label class="text-sm font-medium leading-none">Image URL</label>
                    <input type="url" name="image" value="${product.image || 'https://api.dicebear.com/7.x/shapes/svg?seed=' + (product.id || 'new')}" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                 </div>
                 
                 <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">Save Product</button>
               </form>
               <div class="mt-4 text-center">
                  <a href="/admin" class="text-sm text-muted-foreground hover:text-primary">Cancel</a>
               </div>
             </div>
          </div>
       </div>`;
    return renderAdminLayout(content, 'products', user);
}

function renderCardManager(product, cards, user) {
    const content = `
      <div class="flex items-center justify-between space-y-2 mb-6">
        <div>
           <h2 class="text-3xl font-bold tracking-tight">Stock: ${product.name}</h2>
           <p class="text-muted-foreground">Manage card keys for this product</p>
        </div>
        <a href="/admin" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
           &larr; Back
        </a>
      </div>
      
      <div class="grid gap-6 md:grid-cols-2">
         <div class="rounded-xl border bg-card text-card-foreground shadow-sm">
             <div class="flex flex-col space-y-1.5 p-6">
                <h3 class="font-semibold leading-none tracking-tight">Add Cards</h3>
                <p class="text-sm text-muted-foreground">Paste keys below, one per line.</p>
             </div>
             <div class="p-6 pt-0">
                 <form action="/admin/cards/save" method="POST" class="space-y-4">
                     <input type="hidden" name="csrf_token" value="${user.csrf_token}">
                     <input type="hidden" name="product_id" value="${product.id}">
                     <textarea name="cards" rows="10" placeholder="AAAA-BBBB-CCCC&#10;DDDD-EEEE-FFFF" class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"></textarea>
                     <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">Import Keys</button>
                 </form>
             </div>
         </div>
         
         <div class="rounded-xl border bg-card text-card-foreground shadow-sm h-[500px] flex flex-col">
             <div class="flex flex-col space-y-1.5 p-6 border-b">
                 <h3 class="font-semibold leading-none tracking-tight">Current Stock</h3>
                 <p class="text-sm text-muted-foreground">${cards.length} available keys</p>
             </div>
             <div class="flex-1 overflow-auto p-0">
                 <table class="w-full caption-bottom text-sm">
                    <thead class="[&_tr]:border-b sticky top-0 bg-card z-10">
                      <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Key</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Date</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody class="[&_tr:last-child]:border-0">
                      ${cards.map(c => `
                        <tr class="border-b transition-colors hover:bg-muted/50">
                            <td class="p-4 align-middle font-mono text-xs break-all">${c.card_key}</td>
                            <td class="p-4 align-middle text-nowrap">${new Date(c.created_at).toLocaleDateString()}</td>
                            <td class="p-4 align-middle">
                               <form action="/admin/cards/delete/${c.id}?pid=${product.id}" method="POST" onsubmit="return confirm('Delete this card?');">
                                 <input type="hidden" name="csrf_token" value="${user.csrf_token}">
                                 <button title="Delete Card" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-8 w-8 p-0">
                                   <i data-lucide="trash-2" class="h-4 w-4"></i>
                                 </button>
                               </form>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                 </table>
             </div>
         </div>
      </div>
    `;
    return renderAdminLayout(content, 'products', user);
}

function renderAdminOrders(orders, user) {
    // We already have copy functionality in getCommonHead? No, previously it was inline.
    // I added a header script in getCommonHead, let's just use a simple inline onclick for the key cells.

    const tableRows = orders.map(o => `
        <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
             <td class="p-4 align-middle text-xs font-mono">${o.order_id}</td>
             <td class="p-4 align-middle">
                <div class="flex flex-col">
                   <span class="text-sm font-medium">${o.username ? `<a href="https://linux.do/u/${o.username}" target="_blank" class="hover:underline hover:text-primary">${o.username}</a>` : (o.email && o.email !== 'Anonymous' ? o.email : 'Guest')}</span>
                   ${(o.username && o.email && o.email !== 'Anonymous') ? `<span class="text-xs text-muted-foreground">${o.email}</span>` : ''}
                </div>
             </td>
             <td class="p-4 align-middle">
                <div>${o.product_name}</div>
                ${o.card_key
            ? `<div class="mt-1 cursor-pointer text-xs font-mono bg-muted/50 px-2 py-1 rounded max-w-[150px] truncate hover:text-primary hover:bg-muted select-all" onclick="navigator.clipboard.writeText('${o.card_key}').then(()=>alert('Copied!'))" title="${o.card_key}">
                       <i data-lucide="key" class="w-3 h-3 inline mr-1"></i>${o.card_key}
                     </div>`
            : ''}
             </td>
             <td class="p-4 align-middle font-medium">${o.amount}</td>
             <td class="p-4 align-middle hidden md:table-cell text-xs font-mono text-muted-foreground">${o.trade_no || '-'}</td>
             <td class="p-4 align-middle">
                <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${o.status === 'delivered' ? 'border-transparent bg-green-100 text-green-700' : o.status === 'paid' ? 'border-transparent bg-yellow-100 text-yellow-700' : 'text-foreground'}">
                   ${o.status.toUpperCase()}
                </span>
             </td>
             <td class="p-4 align-middle hidden md:table-cell text-xs text-muted-foreground">${new Date(o.created_at).toLocaleString()}</td>
             <td class="p-4 align-middle">
                ${(o.status === 'delivered' || o.status === 'paid') && o.trade_no ?
            `<form action="${CONFIG.REFUND_URL}" method="POST" target="_blank" onsubmit="return confirm('Open refund page for ${o.amount} points?');">
                   <input type="hidden" name="pid" value="${CONFIG.MERCHANT_ID}">
                   <input type="hidden" name="key" value="${CONFIG.MERCHANT_KEY}">
                   <input type="hidden" name="trade_no" value="${o.trade_no}">
                   <input type="hidden" name="money" value="${o.amount}">
                   <button class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs">
                     Refund
                   </button>
                </form>` : ''}
             </td>
        </tr>`).join('');

    const content = `
        <div class="flex items-center justify-between space-y-2">
            <h2 class="text-3xl font-bold tracking-tight">Recent Orders</h2>
        </div>
        <div class="rounded-md border bg-card">
            <div class="relative w-full overflow-auto">
                <table class="w-full caption-bottom text-sm">
                   <thead class="[&_tr]:border-b">
                      <tr class="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Product</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Amt</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">TradeNo</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">Date</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                      </tr>
                   </thead>
                   <tbody class="[&_tr:last-child]:border-0">
                      ${tableRows}
                   </tbody>
                </table>
            </div>
        </div>
    `;
    return renderAdminLayout(content, 'orders', user);
}

// ==================== Database Helpers ====================

async function getProducts(db) {
    const { results } = await db.prepare(`
        SELECT p.*, 
        COUNT(CASE WHEN c.is_used = 0 THEN 1 END) as stock,
        COUNT(CASE WHEN c.is_used = 1 THEN 1 END) as sold
        FROM products p 
        LEFT JOIN cards c ON p.id = c.product_id 
        GROUP BY p.id
    `).all();
    return results;
}
async function getProduct(db, id) {
    return await db.prepare(`
        SELECT p.*, COUNT(c.id) as stock 
        FROM products p 
        LEFT JOIN cards c ON p.id = c.product_id AND c.is_used = 0 
        WHERE p.id = ? 
        GROUP BY p.id
    `).bind(id).first();
}
async function getOrders(db, limit = 50) {
    const { results } = await db.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT ?').bind(limit).all();
    return results;
}
async function getUnusedCards(db, pid) {
    const { results } = await db.prepare('SELECT * FROM cards WHERE product_id = ? AND is_used = 0 ORDER BY created_at DESC').bind(pid).all();
    return results;
}

// ==================== Workers Logic ====================

// Auth Middleware
async function getSession(request, env) {
    const cookie = request.headers.get('Cookie');
    if (!cookie) return null;
    const match = cookie.match(new RegExp(`${CONFIG.COOKIE_SESSION}=([^;]+)`));
    if (!match) return null;
    const sessionId = match[1];

    // Check D1
    const session = await env.DB.prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > datetime("now")').bind(sessionId).first();
    return session;
}

async function isAdmin(request, env) {
    const user = await getSession(request, env);
    if (!user) return false;
    const lowerAdmins = CONFIG.ADMIN_USERS.map(u => u.toLowerCase());
    return lowerAdmins.includes(user.username.toLowerCase());
}


const HTML_HEADER = { 'Content-Type': 'text/html; charset=utf-8' };

export default {
    async fetch(request, env, ctx) {
        // Initialize Configuration from Env on first load
        if (!CONFIG) {
            CONFIG = { ...DEFAULT_CONFIG, OAUTH: { ...DEFAULT_CONFIG.OAUTH } }; // Shallow copy + deep copy OAUTH
            if (env.MERCHANT_ID) CONFIG.MERCHANT_ID = env.MERCHANT_ID;
            if (env.MERCHANT_KEY) CONFIG.MERCHANT_KEY = env.MERCHANT_KEY;

            if (env.OAUTH_CLIENT_ID) CONFIG.OAUTH.CLIENT_ID = env.OAUTH_CLIENT_ID;
            if (env.OAUTH_CLIENT_SECRET) CONFIG.OAUTH.CLIENT_SECRET = env.OAUTH_CLIENT_SECRET;
            if (env.OAUTH_REDIRECT_URI) CONFIG.OAUTH.REDIRECT_URI = env.OAUTH_REDIRECT_URI;

            if (env.ADMIN_USERS) CONFIG.ADMIN_USERS = env.ADMIN_USERS.split(',');
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // Auth Routes
            if (path === '/auth/login') return handleAuthLogin(request);
            if (path === '/authcallback') return await handleAuthCallback(request, env);
            if (path === '/auth/logout') return await handleAuthLogout(request, env);

            // Public Routes
            if (path === '/') return new Response(renderHomePage(await getProducts(env.DB), await getSession(request, env)), { headers: HTML_HEADER });
            if (path.startsWith('/buy/')) {
                const p = await getProduct(env.DB, path.split('/').pop());
                const user = await getSession(request, env);
                return p ? new Response(renderBuyPage(p, user), { headers: HTML_HEADER }) : new Response('Not Found', { status: 404 });
            }
            if (path === '/order/create' && request.method === 'POST') return await handleCreateOrder(request, env);
            if (path === '/notify') return await handleNotify(request, env);
            if (path === '/return' || path === '/callback') return await handleReturn(request, env);

            // Query Order & History
            if (path === '/query') {
                const user = await getSession(request, env);
                let history = [];
                // If logged in, get from DB
                if (user) {
                    const { results } = await env.DB.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 20').bind(user.user_id).all();
                    history = results;
                }
                return new Response(renderQueryPage(history, user), { headers: HTML_HEADER });
            }


            // Admin Routes
            if (path.startsWith('/admin')) {
                if (!await isAdmin(request, env)) {
                    return new Response('Access Denied. Please Login with an Authorized Linux DO Account.', { status: 403, headers: HTML_HEADER });
                }
                const user = await getSession(request, env); // Get user for CSRF Token

                // Dashboard
                if (path === '/admin') {
                    return new Response(renderAdminDashboardWithUser(await getProducts(env.DB), user), { headers: HTML_HEADER });
                }
                if (path === '/admin/orders') {
                    return new Response(renderAdminOrders(await getOrders(env.DB), user), { headers: HTML_HEADER });
                }
                if (path.startsWith('/admin/order/refund/') && request.method === 'POST') {
                    // Check CSRF
                    const fd = await request.clone().formData(); // Clone because handleAdminRefund might read body too? Actually handleAdminRefund reads param from URL, but verification needs formData
                    if (fd.get('csrf_token') !== user.csrf_token) return new Response('CSRF Token Mismatch', { status: 403 });

                    return await handleAdminRefund(request, env);
                }

                // Product Editor
                if (path === '/admin/product/new') return new Response(renderProductForm({}, user), { headers: HTML_HEADER });
                if (path.startsWith('/admin/product/edit/')) {
                    const p = await getProduct(env.DB, path.replace('/admin/product/edit/', ''));
                    return new Response(renderProductForm(p, user), { headers: HTML_HEADER });
                }
                // Save Product
                if (path === '/admin/product/save' && request.method === 'POST') {
                    const fd = await request.formData();
                    if (fd.get('csrf_token') !== user.csrf_token) return new Response('CSRF Token Mismatch', { status: 403 });

                    const p = Object.fromEntries(fd);
                    await env.DB.prepare(`INSERT OR REPLACE INTO products (id, name, description, price, category, image) VALUES (?, ?, ?, ?, ?, ?)`).bind(p.id, p.name, p.description, p.price, p.category, p.image).run();
                    return Response.redirect(`${url.origin}/admin`, 302);
                }
                // Delete Product
                if (path.startsWith('/admin/product/delete/') && request.method === 'POST') {
                    const fd = await request.formData();
                    if (fd.get('csrf_token') !== user.csrf_token) return new Response('CSRF Token Mismatch', { status: 403 });

                    const id = path.replace('/admin/product/delete/', '');
                    // Delete associated cards first then product
                    await env.DB.batch([
                        env.DB.prepare('DELETE FROM cards WHERE product_id = ?').bind(id),
                        env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id)
                    ]);
                    return Response.redirect(`${url.origin}/admin`, 302);
                }

                // Cards Manager
                if (path.startsWith('/admin/cards/list/')) {
                    const pid = path.replace('/admin/cards/list/', '');
                    const p = await getProduct(env.DB, pid);
                    const cards = await getUnusedCards(env.DB, pid);
                    return new Response(renderCardManager(p, cards, user), { headers: HTML_HEADER });
                }
                // Add Cards
                if (path === '/admin/cards/save' && request.method === 'POST') {
                    const fd = await request.formData();
                    if (fd.get('csrf_token') !== user.csrf_token) return new Response('CSRF Token Mismatch', { status: 403 });

                    const productId = fd.get('product_id');
                    const cards = fd.get('cards').split('\n').map(c => c.trim()).filter(c => c);
                    if (cards.length > 0) {
                        const stmt = env.DB.prepare('INSERT INTO cards (product_id, card_key) VALUES (?, ?)');
                        await env.DB.batch(cards.map(c => stmt.bind(productId, c)));
                    }
                    return Response.redirect(`${url.origin}/admin/cards/list/${productId}`, 302);
                }
                // Delete Card
                if (path.startsWith('/admin/cards/delete/') && request.method === 'POST') {
                    const fd = await request.formData();
                    if (fd.get('csrf_token') !== user.csrf_token) return new Response('CSRF Token Mismatch', { status: 403 });

                    const id = path.split('/')[4];
                    const pid = url.searchParams.get('pid');
                    await env.DB.prepare('DELETE FROM cards WHERE id = ?').bind(id).run();
                    return Response.redirect(`${url.origin}/admin/cards/list/${pid}`, 302);
                }
            }

            return new Response('Page Not Found', { status: 404 });

        } catch (e) {
            return new Response('Error: ' + e.message, { status: 500 });
        }
    }
};

// ==================== Logic Handlers ====================

function renderQueryPage(orders = [], user = null) {
    return `<!DOCTYPE html><html class="h-full"><head>${getCommonHead('My Orders')}</head>
    <body class="flex min-h-full flex-col bg-background">
       ${renderHeader(user)}
       <main class="flex-1 container py-10 max-w-3xl">
          ${user ? (orders.length > 0 ? `
           <div class="space-y-6">
              <div class="flex items-center justify-between">
                  <h2 class="text-3xl font-bold tracking-tight">My Orders</h2>
                  <span class="text-sm text-muted-foreground">${orders.length} orders</span>
              </div>
              <div class="grid gap-4">
                 ${orders.map(order => `
                 <a href="/callback?out_trade_no=${order.order_id}" class="block group">
                    <div class="rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:border-primary/50">
                       <div class="p-6">
                          <div class="flex items-start justify-between mb-4">
                             <div>
                                <h4 class="font-semibold text-lg group-hover:text-primary transition-colors">${order.product_name}</h4>
                                <p class="text-xs font-mono text-muted-foreground mt-1">${order.order_id}</p>
                             </div>
                             <span class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${order.status === 'delivered' ? 'border-transparent bg-green-100 text-green-700' : order.status === 'paid' ? 'border-transparent bg-yellow-100 text-yellow-700' : 'text-foreground'}">
                                ${order.status.toUpperCase()}
                             </span>
                          </div>
                          <div class="flex items-center justify-between pt-4 border-t text-sm">
                             <div class="text-muted-foreground">
                                ${new Date(order.created_at).toLocaleDateString()} <span class="text-xs opacity-70">${new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                             <div class="font-bold text-lg">${order.amount} pts</div>
                          </div>
                       </div>
                    </div>
                 </a>`).join('')}
              </div>
           </div>` : `
           <div class="flex flex-col items-center justify-center py-20 text-center">
              <div class="rounded-full bg-muted p-6 mb-4">
                  <i data-lucide="shopping-bag" class="w-10 h-10 text-muted-foreground"></i>
              </div>
              <h3 class="text-xl font-semibold">No orders yet</h3>
              <p class="text-muted-foreground mt-2 mb-6 max-w-sm">You haven't placed any orders yet. Visit the store to find something you like.</p>
              <a href="/" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                 Browse Shop
              </a>
           </div>`)
            : `
            <div class="flex items-center justify-center py-20">
              <div class="rounded-xl border bg-card text-card-foreground shadow-sm w-full max-w-md p-8 text-center">
                 <div class="mb-6 flex justify-center">
                    <div class="rounded-full bg-primary/10 p-4">
                        <i data-lucide="lock" class="w-8 h-8 text-primary"></i>
                    </div>
                 </div>
                 <h3 class="text-2xl font-bold tracking-tight mb-2">Unlock Your History</h3>
                 <p class="text-muted-foreground mb-8">Log in with your Linux DO account to access all your purchased items securely.</p>
                 <a href="/auth/login" class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full">
                    Login with Linux DO
                 </a>
              </div>
            </div>`
        }
       </main>
       ${renderFooter()}
    </body></html>`;
}


async function handleCreateOrder(request, env) {
    const user = await getSession(request, env);
    if (!user) return new Response('Login Required', { status: 401 });

    const formData = await request.formData();
    // Verify CSRF
    if (formData.get('csrf_token') !== user.csrf_token) return new Response('CSRF Authorization Failed', { status: 403 });

    const product = await getProduct(env.DB, formData.get('product_id'));
    if (!product) return new Response('Product not found', { status: 404 });

    // Stock check
    const stock = await env.DB.prepare('SELECT COUNT(*) as count FROM cards WHERE product_id = ? AND is_used = 0').bind(product.id).first();
    if (stock.count <= 0) return new Response('Out of Stock', { status: 400 });

    const orderId = generateOrderId();

    await env.DB.prepare(`INSERT INTO orders (order_id, product_id, product_name, amount, email, status, user_id, username, created_at) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, datetime('now'))`)
        .bind(orderId, product.id, product.name, product.price,
            formData.get('email') || (user && user.email) || null,
            user ? user.user_id : null, user ? user.username : null).run();

    const url = new URL(request.url);
    const payParams = {
        pid: CONFIG.MERCHANT_ID, type: 'epay', out_trade_no: orderId,
        notify_url: `${url.origin}/notify`, return_url: `${url.origin}/return`, // keeping return for param signing legacy
        name: product.name, money: Number(product.price).toFixed(2), sign_type: 'MD5'
    };
    payParams.sign = await generateSign(payParams, CONFIG.MERCHANT_KEY);

    // Auto-submit form for POST request
    const html = `<!DOCTYPE html><html><body onload="document.forms[0].submit()">
    <form action="${CONFIG.PAY_URL}" method="POST">
       ${Object.entries(payParams).map(([k, v]) => `<input type="hidden" name="${k}" value="${v}">`).join('')}
    </form>
    </body></html>`;

    // Handle Session Cookies (History + Pending)
    const headers = new Headers(HTML_HEADER);

    // 1. Pending Order (for immediate callback). Session only.
    headers.append('Set-Cookie', `ldc_pending_order=${orderId}; Path=/; Secure; SameSite=Lax`);

    return new Response(html, { headers });
}

async function handleNotify(request, env) {
    let params = {};
    if (request.method === 'POST') {
        const ct = request.headers.get('content-type') || '';
        if (ct.includes('form')) (await request.formData()).forEach((v, k) => params[k] = v);
        else new URLSearchParams(await request.text()).forEach((v, k) => params[k] = v);
    } else new URL(request.url).searchParams.forEach((v, k) => params[k] = v);

    if (!await verifySign(params, CONFIG.MERCHANT_KEY)) return new Response('fail', { status: 400 });

    if (params.trade_status === 'TRADE_SUCCESS') {
        const orderId = params.out_trade_no;
        const tradeNo = params.trade_no;
        const order = await env.DB.prepare('SELECT * FROM orders WHERE order_id = ?').bind(orderId).first();

        if (order && order.status === 'pending') {
            const card = await env.DB.prepare('SELECT * FROM cards WHERE product_id = ? AND is_used = 0 LIMIT 1').bind(order.product_id).first();
            if (card) {
                await env.DB.batch([
                    env.DB.prepare('UPDATE cards SET is_used = 1, used_at = datetime("now") WHERE id = ?').bind(card.id),
                    env.DB.prepare("UPDATE orders SET status = 'delivered', paid_at = datetime('now'), delivered_at = datetime('now'), trade_no = ?, card_key = ? WHERE order_id = ?").bind(tradeNo, card.card_key, orderId)
                ]);
            } else {
                await env.DB.prepare("UPDATE orders SET status = 'paid', paid_at = datetime('now'), trade_no = ? WHERE order_id = ?").bind(tradeNo, orderId).run();
            }
        }
    }
    return new Response('success');
}

async function handleAuthLogin(request) {
    const state = Math.random().toString(36).substring(7);
    const url = `${CONFIG.OAUTH.AUTH_URL}?response_type=code&client_id=${CONFIG.OAUTH.CLIENT_ID}&state=${state}&redirect_uri=${encodeURIComponent(CONFIG.OAUTH.REDIRECT_URI)}`;
    return Response.redirect(url, 302);
}

async function handleAuthCallback(request, env) {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    if (!code) return new Response('Missing code', { status: 400 });

    // Exchange Code for Token
    const tokenResp = await fetch(CONFIG.OAUTH.TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: CONFIG.OAUTH.CLIENT_ID,
            client_secret: CONFIG.OAUTH.CLIENT_SECRET,
            code: code,
            redirect_uri: CONFIG.OAUTH.REDIRECT_URI
        })
    });

    if (!tokenResp.ok) return new Response('Failed to get token: ' + await tokenResp.text(), { status: 400 });
    const tokenData = await tokenResp.json();

    // Get User Info
    const userResp = await fetch(CONFIG.OAUTH.USER_URL, {
        headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });

    if (!userResp.ok) return new Response('Failed to get user info', { status: 400 });
    const userInfo = await userResp.json();

    // Create Session
    const sessionId = crypto.randomUUID();
    const csrfToken = crypto.randomUUID(); // Generate CSRF Token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    await env.DB.prepare('INSERT INTO sessions (id, user_id, username, avatar_url, trust_level, expires_at, csrf_token) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(sessionId, userInfo.id, userInfo.username, userInfo.avatar_url, userInfo.trust_level, expiresAt, csrfToken).run();

    return new Response('', {
        status: 302,
        headers: {
            'Location': '/',
            'Set-Cookie': `${CONFIG.COOKIE_SESSION}=${sessionId}; Path=/; Secure; SameSite=Lax; HttpOnly`
        }
    });
}

async function handleAuthLogout(request, env) {
    const cookie = request.headers.get('Cookie');
    if (cookie) {
        const match = cookie.match(new RegExp(`${CONFIG.COOKIE_SESSION}=([^;]+)`));
        if (match) {
            await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(match[1]).run();
        }
    }
    return new Response('', {
        status: 302,
        headers: {
            'Location': '/',
            'Set-Cookie': `${CONFIG.COOKIE_SESSION}=; Path=/; Max-Age=0`
        }
    });
}


async function handleAdminRefund(request, env) {
    if (!await isAdmin(request, env)) return new Response('Access Denied', { status: 403 });

    const url = new URL(request.url);
    const orderId = url.pathname.split('/').pop();

    const order = await env.DB.prepare('SELECT * FROM orders WHERE order_id = ?').bind(orderId).first();
    if (!order) return new Response('Order not found', { status: 404 });
    if (order.status !== 'delivered' && order.status !== 'paid') {
        return new Response('Order status not refundable', { status: 400 });
    }
    if (!order.trade_no) {
        return new Response('Missing trade_no (Linux DO Trade ID), cannot refund.', { status: 400 });
    }

    // Call Linux DO Credit Refund API
    const params = {
        pid: CONFIG.MERCHANT_ID,
        key: CONFIG.MERCHANT_KEY,
        trade_no: order.trade_no,
        money: order.amount
    };

    try {
        const resp = await fetch(CONFIG.REFUND_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'LDC-Shop-Worker/1.0',
                'Accept': 'application/json'
            },
            body: new URLSearchParams(params)
        });
        const text = await resp.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            return new Response(`Refund API Error (Invalid JSON): ${text.substring(0, 500)}...`, { status: 502 });
        }

        if (result.code === 1) {
            await env.DB.prepare("UPDATE orders SET status = 'refunded' WHERE order_id = ?").bind(orderId).run();
            // Optional: If delivered, we technically should "revoke" the key, but we'll just leave it marked as used/delivered locally mostly.
            // But we already updated status to refunded.
            return Response.redirect(`${url.origin}/admin/orders`, 302);
        } else {
            return new Response(`Refund Failed: ${result.msg || JSON.stringify(result)}`, { status: 400 });
        }
    } catch (e) {
        return new Response(`Refund Error: ${e.message}`, { status: 500 });
    }
}

async function handleReturn(request, env) {
    const url = new URL(request.url);
    let orderId = url.searchParams.get('out_trade_no');

    // Fallback: Check Cookie
    if (!orderId) {
        const cookie = request.headers.get('Cookie');
        if (cookie) {
            const match = cookie.match(/ldc_pending_order=([^;]+)/);
            if (match) orderId = match[1];
        }
    }

    if (!orderId) {
        // Debug Information
        return new Response(`Order ID missing in callback.\nURL: ${request.url}\nCookies: ${request.headers.get('Cookie')}`, { headers: HTML_HEADER, status: 400 });
    }

    const order = await env.DB.prepare('SELECT * FROM orders WHERE order_id = ?').bind(orderId).first();

    if (!order) {
        return new Response(`Order not found for ID: ${orderId}`, { headers: HTML_HEADER, status: 404 });
    }

    // Security Check: Only show key if session cookie matches
    let showKey = false;
    const cookie = request.headers.get('Cookie') || '';
    if (cookie) {
        const pendingMatch = cookie.match(/ldc_pending_order=([^;]+)/);
        if (pendingMatch && pendingMatch[1] === orderId) showKey = true;
    }

    const user = await getSession(request, env);
    // If logged in user owns this order, allow view
    if (user && order.user_id === user.user_id) showKey = true;

    return new Response(renderOrderPage(order, showKey, user), { headers: HTML_HEADER });
}
