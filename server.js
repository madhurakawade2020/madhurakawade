const express = require('express');
const app = express();
const db = require('./db');

const port = 3000;

app.get('/api/getVendorUsers', (req, res) => {
  const { prId, custOrgId } = req.query;

  if (!prId || !custOrgId) {
    return res.status(400).json({ error: 'Missing prId or custOrgId' });
  }

  const sqlQuery = `
    SELECT 
      v.VendorOrganizationId AS supplierId,
      v.UserName,
      v.Name
    FROM 
      PrLineItems p
    JOIN 
      VendorUsers v ON FIND_IN_SET(v.VendorOrganizationId, p.suppliers)
    WHERE 
      p.purchaseRequestId = ? AND p.custOrgId = ? AND v.Role = 'Admin'
    GROUP BY 
      v.VendorOrganizationId, v.UserName, v.Name;
  `;

  db.query(sqlQuery, [prId, custOrgId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error', details: err });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
