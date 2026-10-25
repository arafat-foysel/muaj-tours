const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Connect to SQLite Database and ensure tables exist
const dbPath = path.join(__dirname, 'database', 'muaj.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        
        // 1. Packages Table with category field (shifting / non-shifting)
        db.run(`CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            category TEXT,
            title TEXT,
            price TEXT,
            duration TEXT,
            description TEXT
        )`, (err) => {
            if (!err) {
                db.run(`ALTER TABLE packages ADD COLUMN category TEXT`, () => {});
                db.run(`ALTER TABLE packages ADD COLUMN duration TEXT`, () => {});
                db.run(`ALTER TABLE packages ADD COLUMN description TEXT`, () => {});

                db.get("SELECT COUNT(*) as count FROM packages", (err, row) => {
                    if (!err && row.count === 0) {
                        db.run(`INSERT INTO packages (type, category, title, price, duration, description) VALUES 
                            ('hajj', 'non-shifting', 'ভিআইপি এক্সিকিউটিভ হজ', '৮,৫০,০০০', '৪০-৪৫ দিন • নন-শিফটিং', 'মক্কা: ক্লক টাওয়ার / ফেয়ারমন্ট অথবা সমমানের কোনো হোটেল'),
                            ('hajj', 'non-shifting', 'প্রিমিয়াম ডিলাক্স হজ', '৬,৭০,০০০', '৩৫-৪০ দিন • নন-শিফটিং', 'মক্কা: সুইসোটেল / আল সাফওয়াহ অথবা সমমানের কোনো হোটেল'),
                            ('hajj', 'non-shifting', 'স্ট্যান্ডার্ড কমফোর্ট হজ', '৫,৫০,০০০', '৩০-৩৫ দিন • নন-শিফটিং', 'মক্কা: মিসফালাহ / ইব্রাহিম খলিল রোড অথবা সমমানের কোনো হোটেল'),
                            ('hajj', 'shifting', 'শিফটিং গোল্ড হজ প্যাকেজ', '৭,২০,০০০', '৪০ দিন • শিফটিং', 'মক্কা ও মদিনা শিফটিং জোন অথবা সমমানের কোনো হোটেল'),
                            ('hajj', 'shifting', 'শিফটিং সিলভার হজ প্যাকেজ', '৬,১০,০০০', '৪০ দিন • শিফটিং', 'আজিজিয়া ও হারাম জোন অথবা সমমানের কোনো হোটেল'),
                            ('hajj', 'shifting', 'শিফটিং ইকোনমি হজ প্যাকেজ', '৫,২০,০০০', '৩৫ দিন • শিফটিং', 'বাজেট ফ্রেন্ডলি শিফটিং আবাসন অথবা সমমানের কোনো হোটেল')
                        `);
                    }
                });
            }
        });

        // 2. Inquiries Table
        db.run(`CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            package_name TEXT,
            name TEXT,
            phone TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, () => {
            db.run(`ALTER TABLE inquiries ADD COLUMN package_name TEXT`, () => {});
            db.run(`ALTER TABLE inquiries ADD COLUMN message TEXT`, () => {});
        });

        // 3. Site Settings Table (For Client CMS)
        db.run(`CREATE TABLE IF NOT EXISTS site_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`, () => {
            db.get("SELECT COUNT(*) as count FROM site_settings", (err, row) => {
                if (row.count === 0) {
                    db.run("INSERT INTO site_settings (key, value) VALUES ('whatsapp_number', '8801800000999')");
                    db.run("INSERT INTO site_settings (key, value) VALUES ('helpline_number', '+৮৮০ ১৮০০-০০০৯৯৯')");
                    db.run("INSERT INTO site_settings (key, value) VALUES ('office_address', 'স্যুট #৪০২, পল্টন টাওয়ার, বিজয়নগর, ঢাকা')");
                    db.run("INSERT INTO site_settings (key, value) VALUES ('office_email', 'info@muajtours.com.bd')");
                    db.run("INSERT INTO site_settings (key, value) VALUES ('office_hours', 'শনি - বৃহস্পতিবার: সকাল ৯:০০ - রাত ৮:০০')");
                    db.run("INSERT INTO site_settings (key, value) VALUES ('announcement_text', 'ধর্ম বিষয়ক মন্ত্রণালয় এবং সৌদি হজ ও উমরাহ মন্ত্রণালয় অনুমোদিত লাইসেন্স নং: ১৪৭৮')");
                }
            });
        });
    }
});

// GET API: Fetch all packages
app.get('/api/packages', (req, res) => {
    db.all("SELECT * FROM packages", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST API: Add New Package (CMS)
app.post('/api/packages', (req, res) => {
    const { type, category, title, price, duration, description } = req.body;
    const query = `INSERT INTO packages (type, category, title, price, duration, description) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [type, category || 'non-shifting', title, price, duration, description], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

// PUT API: Update Package
app.put('/api/packages/:id', (req, res) => {
    const { title, price, duration, description, category } = req.body;
    const query = `UPDATE packages SET title = ?, price = ?, duration = ?, description = ?, category = ? WHERE id = ?`;
    db.run(query, [title, price, duration, description, category, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// DELETE API: Remove Package
app.delete('/api/packages/:id', (req, res) => {
    db.run("DELETE FROM packages WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// GET API: Fetch site settings
app.get('/api/settings', (req, res) => {
    db.all("SELECT * FROM site_settings", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const settings = {};
        rows.forEach(r => settings[r.key] = r.value);
        res.json(settings);
    });
});

// POST API: Save/Update site settings
app.post('/api/settings', (req, res) => {
    const settings = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)");
    for (const [key, value] of Object.entries(settings)) {
        stmt.run(key, value);
    }
    stmt.finalize(err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// POST API: Save booking / inquiry
app.post('/api/inquiries', (req, res) => {
    const { package_name, name, phone, message } = req.body;
    const query = `INSERT INTO inquiries (package_name, name, phone, message) VALUES (?, ?, ?, ?)`;
    db.run(query, [package_name, name, phone, message], function(err) {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// GET API: Fetch all customer inquiries (Admin view)
app.get('/api/inquiries', (req, res) => {
    db.all("SELECT * FROM inquiries ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});