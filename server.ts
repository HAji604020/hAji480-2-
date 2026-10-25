import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbManager } from './src/server/db';
import { generateUniversalSalesReply } from './src/utils/salesAssistantEngine';
import { Language } from './src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Auth middleware for extracting and checking user
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'UNAUTHENTICATED: Bearer token required' });
  }

  const user = dbManager.authenticateUser(authHeader);
  if (!user) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS: User session not found' });
  }

  (req as any).user = user;
  next();
}

// -------------------------------------------------------------
// PUBLIC API ENDPOINTS (No login required)
// -------------------------------------------------------------

// 1. Get Public Catalog for any company via slug
app.get('/api/public/catalog/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const company = dbManager.getCompanyBySlug(slug);
  if (!company) {
    return res.status(404).json({ error: 'Company catalog not found' });
  }

  // Strictly return ONLY published products
  const publishedProducts = dbManager.getProducts(company.id, null, false);

  res.json({
    company: {
      id: company.id,
      slug: company.slug,
      name: company.name,
      industry: company.industry,
      country: company.country,
      currency: company.currency,
      logoUrl: company.logoUrl,
      bannerUrl: company.bannerUrl,
      brandColors: company.brandColors,
      contactPhone: company.contactPhone,
      contactEmail: company.contactEmail,
      address: company.address,
      settings: company.settings
    },
    products: publishedProducts
  });
});

// 2. Submit Public Customer Inquiry or Wholesale Quote Request
app.post('/api/public/inquiries', (req: Request, res: Response) => {
  try {
    const { companyId, customerName, customerContact, customerLocation, inquiryType, productId, productName, requestedQuantity, message, replyLanguage } = req.body;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }

    const inquiry = dbManager.createInquiry({
      companyId,
      customerName,
      customerContact,
      customerLocation,
      inquiryType,
      productId,
      productName,
      requestedQuantity: parseInt(requestedQuantity, 10) || 1,
      message,
      replyLanguage: replyLanguage || 'fa'
    });

    res.status(201).json(inquiry);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Image Upload Endpoint (Persists data URLs / base64 image strings)
app.post('/api/upload-image', (req: Request, res: Response) => {
  const { imageData, name } = req.body;
  if (!imageData) {
    return res.status(400).json({ error: 'Image data is required' });
  }

  // Returns persistent image URI
  res.json({
    url: imageData,
    filename: name || `product-image-${Date.now()}`
  });
});

// -------------------------------------------------------------
// AUTHENTICATION & ONBOARDING
// -------------------------------------------------------------

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { token, email } = req.body;
  const users = dbManager.getUsers();

  let user = null;
  if (token) {
    user = dbManager.authenticateUser(token);
  } else if (email) {
    user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  if (!user) {
    return res.status(401).json({ error: 'User not found or invalid token' });
  }

  const company = user.companyId ? dbManager.getCompanyById(user.companyId) : null;
  res.json({ user, company });
});

// Self-service Company Registration Flow
app.post('/api/auth/register-company', (req: Request, res: Response) => {
  try {
    const { name, industry, country, currency, adminEmail, adminName, contactPhone, brandColors } = req.body;
    if (!name || !adminEmail) {
      return res.status(400).json({ error: 'Company name and admin email are required' });
    }

    const result = dbManager.registerCompany(
      {
        name,
        industry: industry || 'Retail & Trade',
        country: country || 'Afghanistan',
        currency: currency || 'USD',
        contactPhone: contactPhone || '+93700000000',
        brandColors: brandColors || { primary: '#1e3a8a', accent: '#3b82f6' }
      },
      adminEmail,
      adminName || 'Company Administrator'
    );

    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// SECURE MULTI-TENANT PRIVATE ENDPOINTS
// -------------------------------------------------------------

// List companies (Platform Owner sees all; regular users only see their own)
app.get('/api/companies', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user.role === 'platform_owner') {
    return res.json(dbManager.getCompanies());
  }
  if (user.companyId) {
    const myComp = dbManager.getCompanyById(user.companyId);
    return res.json(myComp ? [myComp] : []);
  }
  res.json([]);
});

// Update company profile and branding (Tenant Admin only)
app.put('/api/companies/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const companyId = req.params.id;

  try {
    const updated = dbManager.updateCompany(companyId, req.body, user);
    res.json(updated);
  } catch (err: any) {
    if (err.message.startsWith('SECURITY_VIOLATION')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Products: List private inventory for authenticated company
app.get('/api/products', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const requestedCompanyId = (req.query.companyId as string) || user.companyId;

  if (!requestedCompanyId) {
    return res.status(400).json({ error: 'companyId query param required' });
  }

  try {
    const products = dbManager.getProducts(requestedCompanyId, user, true);
    res.json(products);
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

// Create product (Authenticated company admin or staff)
app.post('/api/products', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const newProduct = dbManager.createProduct(req.body, user);
    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Update product (Strict Tenant Check: product must belong to user's company!)
app.put('/api/products/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const productId = req.params.id;

  try {
    const updated = dbManager.updateProduct(productId, req.body, user);
    res.json(updated);
  } catch (err: any) {
    if (err.message.startsWith('SECURITY_BREACH_ATTEMPT')) {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete product (Strict Tenant Check)
app.delete('/api/products/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const productId = req.params.id;

  try {
    const success = dbManager.deleteProduct(productId, user);
    res.json({ success });
  } catch (err: any) {
    res.status(403).json({ error: err.message });
  }
});

// Inquiries: List private leads for company
app.get('/api/inquiries', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const companyId = (req.query.companyId as string) || user.companyId;

  if (!companyId) {
    return res.status(400).json({ error: 'companyId required' });
  }

  try {
    const inquiries = dbManager.getInquiries(companyId, user);
    res.json(inquiries);
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

// Support Tickets: List private tickets for company
app.get('/api/support/tickets', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const companyId = (req.query.companyId as string) || user.companyId;

  if (!companyId) {
    return res.status(400).json({ error: 'companyId required' });
  }

  try {
    const tickets = dbManager.getSupportTickets(companyId, user);
    res.json(tickets);
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

// Support Tickets: Create a new support ticket
app.post('/api/support/tickets', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  try {
    const newTicket = dbManager.createSupportTicket(req.body, user);
    res.status(201).json(newTicket);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Support Tickets: Update ticket status or fields
app.patch('/api/support/tickets/:id', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user;
  const ticketId = req.params.id;
  try {
    const updated = dbManager.updateSupportTicket(ticketId, req.body, user);
    res.json(updated);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// AI Sales Assistant endpoint (strictly grounded in company & product facts)
app.post('/api/ai/generate-reply', authenticate, (req: Request, res: Response) => {
  const { productId, customerMessage, targetLang } = req.body;
  if (!productId || !customerMessage) {
    return res.status(400).json({ error: 'productId and customerMessage required' });
  }

  const product = dbManager.getProductById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const company = dbManager.getCompanyById(product.companyId);
  if (!company) {
    return res.status(404).json({ error: 'Company not found' });
  }

  const reply = generateUniversalSalesReply(product, company, customerMessage, (targetLang as Language) || 'fa');
  res.json(reply);
});

// Automated Cross-Tenant Security Audit endpoint
app.post('/api/tests/cross-tenant-isolation', authenticate, (req: Request, res: Response) => {
  const auditResults = dbManager.runCrossTenantSecurityAudit();
  res.json({
    timestamp: new Date().toISOString(),
    totalTests: auditResults.length,
    allPassed: auditResults.every((r) => r.isIsolated),
    results: auditResults
  });
});

// -------------------------------------------------------------
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DukanAI SaaS] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
