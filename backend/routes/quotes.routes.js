const express = require('express');
const { z } = require('zod');
const nodemailer = require('nodemailer');
const { prisma } = require('../config/state');
const { validate } = require('../middleware/validation.middleware');
const { getEmailConfig, getPrimaryFrontendUrl } = require('../config/env');
const logger = require('../utils/logger');

const router = express.Router();
const { requireCustomer } = require('../middleware/auth.middleware');

router.get('/my-quotes', requireCustomer, async (req, res) => {
  try {
    const quotes = await prisma.quoteRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    // Filter quotes where customer name matches or any item's customerEmail matches user's email
    const myQuotes = quotes.filter(q => 
      q.customerName === req.user.name || 
      (Array.isArray(q.items) && q.items.some(i => i.customerEmail === req.user.email))
    );
    res.json(myQuotes);
  } catch (error) {
    logger.error('Fetch My Quotes Error:', error);
    res.status(500).json({ error: 'Error fetching quote history' });
  }
});

const quoteItemSchema = z.object({
  name: z.string({ required_error: "Item name is required" }).min(1, "Item name is required"),
  qty: z.union([z.number(), z.string()]).transform((val) => Number(val)).optional().default(1),
  customerEmail: z.string().email("Invalid email").optional().nullable().or(z.literal('')),
  message: z.string().optional().nullable(),
  requirements: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const quotesSchema = z.object({
  customerName: z.string({ required_error: "Customer name is required" }).trim().min(1, "Customer name is required"),
  customerPhone: z.string({ required_error: "Customer phone is required" }).trim().min(1, "Customer phone is required"),
  items: z.union([z.array(quoteItemSchema), z.any()]).refine((val) => {
    if (Array.isArray(val)) return val.length > 0;
    return val !== undefined && val !== null;
  }, "Items are required")
});

router.post('/', validate(quotesSchema), async (req, res) => {
  logger.info('Received Quote Request:', req.body);
  const { customerName, customerPhone, items } = req.body;
  try {
    const quote = await prisma.quoteRequest.create({
      data: { customerName, customerPhone, items }
    });
    
    const emailConfig = getEmailConfig();
    if (emailConfig.isConfigured) {
      logger.info('Sending quote notification email to store owner');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { 
          user: emailConfig.user, 
          pass: emailConfig.pass
        }
      });
      const itemsList = Array.isArray(items) ? items.map(i => {
        const note = i.message || i.requirements || i.notes;
        const email = i.customerEmail ? `\n  Email: ${i.customerEmail}` : '';
        return `- ${i.name} (Qty: ${i.qty || 1})${email}${note ? `\n  Customer wrote: ${note}` : ''}`;
      }).join('\n') : JSON.stringify(items);
      const adminUrl = `${getPrimaryFrontendUrl()}/admin`;
      const mailOptions = {
        from: `"Digitron Associates" <${emailConfig.user}>`,
        to: emailConfig.user,
        subject: `New Quote Request from ${customerName}`,
        text: `Customer Name: ${customerName}\nPhone: ${customerPhone}\n\nItems Requested:\n${itemsList}\n\nView in Admin Panel: ${adminUrl}`
      };
      transporter.sendMail(mailOptions, (err) => {
        if (err) logger.error('Email Delivery Error:', err?.message || err);
        else logger.info('Email Sent Successfully');
      });
    } else {
      logger.info('Email service unconfigured in .env; saved quote to database.');
    }
    
    res.json({ success: true, quoteId: quote.id });
  } catch (error) {
    logger.error('Quote Creation Error:', error);
    res.status(500).json({ error: 'Error saving quote request' });
  }
});

module.exports = router;
