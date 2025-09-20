import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// --- STYLES ---
const styles = {
  body: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    backgroundColor: '#1a1a1a',
    color: '#e0e0e0',
    margin: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '2rem',
    boxSizing: 'border-box',
  } as React.CSSProperties,
  container: {
    backgroundColor: '#242424',
    borderRadius: '12px',
    padding: '2.5rem',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center' as 'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    border: '1px solid #333',
  } as React.CSSProperties,
  header: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#ffffff',
  } as React.CSSProperties,
  subHeader: {
    fontSize: '1rem',
    color: '#a0a0a0',
    marginBottom: '2rem',
  } as React.CSSProperties,
  statusBox: {
    backgroundColor: 'rgba(45, 201, 133, 0.1)',
    border: '1px solid #2dc985',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    marginBottom: '2.5rem',
  } as React.CSSProperties,
  statusIndicator: {
    width: '12px',
    height: '12px',
    backgroundColor: '#2dc985',
    borderRadius: '50%',
    boxShadow: '0 0 10px #2dc985',
  } as React.CSSProperties,
  statusText: {
    color: '#2dc985',
    fontWeight: '600',
    fontSize: '1.1rem',
  } as React.CSSProperties,
  section: {
    textAlign: 'left' as 'left',
    marginBottom: '2rem',
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: '1rem',
    borderBottom: '1px solid #444',
    paddingBottom: '0.5rem',
  } as React.CSSProperties,
  checklistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
    color: '#c0c0c0',
  } as React.CSSProperties,
  checkIcon: {
    color: '#2dc985',
    fontSize: '1.2rem',
  } as React.CSSProperties,
  footer: {
    marginTop: '2rem',
    fontSize: '0.8rem',
    color: '#777',
  } as React.CSSProperties,
};

// --- COMPONENT ---
function App() {
  // Apply body styles directly to the body element
  Object.assign(document.body.style, styles.body);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Magicfy Automation Service</h1>
      <p style={styles.subHeader}>Shopify → Murphy's Magic Connector</p>

      <div style={styles.statusBox}>
        <div style={styles.statusIndicator}></div>
        <span style={styles.statusText}>Service Online: Awaiting Orders</span>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>How It Works</h2>
        <p style={{ color: '#c0c0c0', lineHeight: 1.6 }}>
          This service runs in the background. It listens for the "Order Paid" event from your Shopify store. When a new order comes in, it automatically sends the details of any downloadable products to Murphy's Magic, adding them to your customer's account instantly.
        </p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Configuration Checklist</h2>
        <div style={styles.checklistItem}>
          <span style={styles.checkIcon}>✓</span>
          <span><strong>Shopify Webhook:</strong> Point the 'Order payment' event to this service's URL.</span>
        </div>
        <div style={styles.checklistItem}>
          <span style={styles.checkIcon}>✓</span>
          <span><strong>Murphy's API Key:</strong> Ensure the <code>API_KEY</code> is set as an environment variable.</span>
        </div>
        <div style={styles.checklistItem}>
          <span style={styles.checkIcon}>✓</span>
          <span><strong>Product SKUs:</strong> The SKU for each downloadable product in Shopify MUST match the Murphy's Magic ProductID.</span>
        </div>
      </div>
      
      <footer style={styles.footer}>
        This page is a confirmation that the automation endpoint is active.
      </footer>
    </div>
  );
}

// --- RENDER ---
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
