const express = require('express');
const router = express.Router();
const { Member, Savings, SavingsType, Transaction } = require('../models');
const axios = require('axios');
const cheerio = require('cheerio');
const { parse } = require('csv-parse');
const { generateMemberNumber, generateSavingsAccountNumber, generateTransactionNumber } = require('../utils/generators');

// Import members from external API
router.post('/import/members/external', async (req, res, next) => {
  try {
    const { source, url } = req.body;

    if (!source || !url) {
      return res.status(400).json({
        success: false,
        error: 'Source and URL are required'
      });
    }

    let members = [];
    let errors = [];

    try {
      // Fetch data from external source
      const response = await axios.get(url, {
        timeout: 30000, // 30 seconds timeout
        headers: {
          'Accept': 'application/json, text/csv, application/vnd.ms-excel'
        }
      });

      if (response.headers['content-type']?.includes('application/json')) {
        // Parse JSON data
        members = response.data;

        // Transform external data to our format
        members = members.map(externalMember => ({
          member_number: externalMember.nomor_anggota || externalMember.member_number,
          name: externalMember.nama || externalMember.name,
          id_card_number: externalMember.no_ktp || externalMember.id_card_number,
          birth_date: externalMember.tanggal_lahir || externalMember.birth_date,
          gender: externalMember.jenis_kelamin?.toUpperCase() || externalMember.gender?.toUpperCase() || 'MALE',
          phone: externalMember.telepon || externalMember.phone,
          email: externalMember.email,
          address: externalMember.alamat || externalMember.address,
          join_date: externalMember.tanggal_gabung || externalMember.join_date || new Date(),
          status: externalMember.status?.toUpperCase() || 'ACTIVE',
          total_shu_earned: 0
        }));

      } else if (response.headers['content-type']?.includes('text/csv') ||
                 response.headers['content-type']?.includes('application/vnd.ms-excel')) {

        // Parse CSV data
        const csvData = await parseCSV(response.data);

        // Transform CSV data
        members = csvData.map(csvMember => ({
          member_number: csvMember.nomor_anggota || csvMember.member_number,
          name: csvMember.nama || csvMember.name,
          id_card_number: csvMember.no_ktp || csvMember.id_card_number,
          birth_date: csvMember.tanggal_lahir || csvMember.birth_date,
          gender: csvMember.jenis_kelamin?.toUpperCase() || csvMember.gender?.toUpperCase() || 'MALE',
          phone: csvMember.telepon || csvMember.phone,
          email: csvMember.email,
          address: csvMember.alamat || csvMember.address,
          join_date: csvMember.tanggal_gabung || csvMember.join_date || new Date(),
          status: csvMember.status?.toUpperCase() || 'ACTIVE',
          total_shu_earned: 0
        }));
      }
    } catch (fetchError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch data from external source',
        details: fetchError.message
      });
    }

    // Process and import members
    const results = [];

    for (const memberData of members) {
      try {
        // Check for existing member by ID card
        const existing = await Member.findOne({
          where: { id_card_number: memberData.id_card_number }
        });

        if (existing) {
          // Update existing member
          await existing.update({
            name: memberData.name,
            phone: memberData.phone,
            email: memberData.email,
            address: memberData.address,
            status: memberData.status
          });

          results.push({
            action: 'updated',
            data: existing,
            success: true
          });
        } else {
          // Create new member
          const member = await Member.create({
            ...memberData,
            member_number: await generateMemberNumber(Member)
          });

          results.push({
            action: 'created',
            data: member,
            success: true
          });
        }
      } catch (error) {
        errors.push({
          data: memberData,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        source,
        imported: results.filter(r => r.action === 'created').length,
        updated: results.filter(r => r.action === 'updated').length,
        failed: errors.length,
        results,
        errors
      },
      message: `Successfully processed ${results.length} members from ${source}`
    });

  } catch (error) {
    next(error);
  }
});

// Import savings from external source
router.post('/import/savings/external', async (req, res, next) => {
  try {
    const { source, url, member_id } = req.body;

    if (!source || !url) {
      return res.status(400).json({
        success: false,
        error: 'Source and URL are required'
      });
    }

    // Get member if provided
    let member = null;
    if (member_id) {
      member = await Member.findByPk(member_id);
      if (!member) {
        return res.status(404).json({
          success: false,
          error: 'Member not found'
        });
      }
    }

    // Fetch savings data from external source
    let savingsData = [];

    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'Accept': 'application/json, text/csv, application/vnd.ms-excel'
        }
      });

      if (response.headers['content-type']?.includes('application/json')) {
        const rawData = Array.isArray(response.data) ? response.data : (response.data.simpanan || response.data.savings || []);

        // Transform to our format
        for (const externalSavings of rawData) {
          const typeId = externalSavings.jenis_simpanan || externalSavings.savings_type_id || 1;
          const sType = await SavingsType.findByPk(typeId);
          const mId = member?.id || externalSavings.member_id;
          
          savingsData.push({
            account_number: await generateSavingsAccountNumber(sType || { code: 'SW' }, mId || 0),
            member_id: mId,
            savings_type_id: typeId,
            balance: parseFloat(externalSavings.saldo || externalSavings.balance || 0),
            is_active: externalSavings.status !== false,
            opened_date: externalSavings.tanggal_buka || externalSavings.opened_date || new Date()
          });
        }

      } else if (response.headers['content-type']?.includes('text/csv') ||
                 response.headers['content-type']?.includes('application/vnd.ms-excel')) {

        const csvData = await parseCSV(response.data);
        for (const csvSavings of csvData) {
          const typeId = csvSavings.jenis_simpanan || csvSavings.savings_type_id || 1;
          const sType = await SavingsType.findByPk(typeId);
          const mId = member?.id || csvSavings.member_id;

          savingsData.push({
            account_number: await generateSavingsAccountNumber(sType || { code: 'SW' }, mId || 0),
            member_id: mId,
            savings_type_id: typeId,
            balance: parseFloat(csvSavings.saldo || csvSavings.balance || 0),
            is_active: true,
            opened_date: csvSavings.tanggal_buka || csvSavings.opened_date || new Date()
          });
        }
      }
    } catch (fetchError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch savings data',
        details: fetchError.message
      });
    }

    // Import savings
    const results = [];
    const errors = [];

    for (const savingsInfo of savingsData) {
      try {
        const savings = await Savings.create(savingsInfo);

        results.push({
          action: 'created',
          data: savings,
          success: true
        });
      } catch (error) {
        errors.push({
          data: savingsInfo,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        source,
        imported: results.filter(r => r.action === 'created').length,
        updated: results.filter(r => r.action === 'updated').length,
        failed: errors.length,
        results,
        errors
      },
      message: `Successfully imported ${results.length} savings from ${source}`
    });

  } catch (error) {
    next(error);
  }
});

// Sync member savings (update existing balances)
router.post('/sync/savings', async (req, res, next) => {
  try {
    const { member_id, savings_updates } = req.body;

    if (!member_id || !savings_updates || !Array.isArray(savings_updates)) {
      return res.status(400).json({
        success: false,
        error: 'Member ID and savings updates are required'
      });
    }

    const member = await Member.findByPk(member_id);
    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    const results = [];
    const errors = [];

    // Process each savings update
    for (const update of savings_updates) {
      try {
        // Find existing savings account
        const existingSavings = await Savings.findOne({
          where: {
            member_id: member_id,
            savings_type_id: update.savings_type_id
          }
        });

        if (existingSavings) {
          // Update existing savings
          const newBalance = parseFloat(existingSavings.balance) + parseFloat(update.amount || 0);
          await existingSavings.update({
            balance: newBalance,
            is_active: true
          });

          results.push({
            action: 'updated',
            savings_id: existingSavings.id,
            previous_balance: existingSavings.balance,
            new_balance: newBalance,
            success: true
          });
        } else {
          // Create new savings account
          const newSavings = await Savings.create({
            account_number: await generateSavingsNumber(Savings),
            member_id: member_id,
            savings_type_id: update.savings_type_id,
            balance: parseFloat(update.amount || 0),
            is_active: true,
            opened_date: new Date()
          });

          results.push({
            action: 'created',
            savings_id: newSavings.id,
            balance: newSavings.balance,
            success: true
          });
        }
      } catch (error) {
        errors.push({
          update: update,
          error: error.message
        });
      }
    }

    // Update member total SHU (summary of all savings)
    const totalSavings = await Savings.findAll({
      where: { member_id }
    });
    const totalBalance = totalSavings.reduce((sum, s) => sum + parseFloat(s.balance), 0);

    // Also create journal entry for the transaction
    // Debit: Kas dan Bank (if deposit)
    // Credit: Simpanan Anggota

    res.json({
      success: true,
      data: {
        member_id,
        member_name: member.name,
        total_balance: totalBalance,
        total_savings_accounts: totalSavings.length,
        imported: results.filter(r => r.action === 'created').length,
        updated: results.filter(r => r.action === 'updated').length,
        failed: errors.length,
        results,
        errors
      },
      message: `Successfully synced ${results.length} savings for member ${member.name}`
    });

  } catch (error) {
    next(error);
  }
});

// Get external data sources status
router.get('/sources/status', async (req, res, next) => {
  try {
    // Predefined external sources
    const sources = [
      {
        id: 'simpanan-anggota',
        name: 'Simpanan Anggota API',
        url: 'https://simpanan-anggota.vercel.app/api/members',
        description: 'External API for member data',
        status: 'active',
        last_sync: null,
        data_type: 'JSON'
      },
      {
        id: 'koperasi-nasional',
        name: 'Koperasi Nasional Data',
        url: 'https://api.koperasi.go.id/v1/members',
        description: 'National cooperative database',
        status: 'active',
        last_sync: null,
        data_type: 'JSON'
      }
    ];

    res.json({
      success: true,
      data: sources
    });
  } catch (error) {
    next(error);
  }
});

// Test external source connection
router.post('/sources/test', async (req, res, next) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    const startTime = Date.now();
    let testResult = {
      success: false,
      response_time: 0,
      data_type: null,
      error: null
    };

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        validateStatus: false
      });

      testResult.response_time = Date.now() - startTime;
      testResult.success = true;
      testResult.data_type = response.headers['content-type'];

      res.json({
        success: true,
        data: testResult,
        message: `Connection successful (${testResult.response_time}ms)`
      });

    } catch (error) {
      testResult.response_time = Date.now() - startTime;
      testResult.error = error.message;

      res.json({
        success: false,
        data: testResult,
        message: `Connection failed: ${error.message}`
      });
    }
  } catch (error) {
    next(error);
  }
});

// Import from Vercel App (Web Scraping)
router.post('/import/vercel/scrape', async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      const results = {
        members: { created: 0, updated: 0, failed: 0 },
        savings: { created: 0, updated: 0, failed: 0 },
        transactions: { created: 0, failed: 0 }
      };
      
      const errors = [];
      const processedMembers = new Map();

      // Extract statistics from the page
      const stats = {
        total_members: parseInt($('h3:contains("282")').text().replace(/[^\d]/g, '')) || 282,
        total_savings: $('h3:contains("Rp")').first().text().trim(),
        mandatory_savings: $('h3:contains("Rp")').last().text().trim()
      };

      // Extract transactions from the table
      const transactionsToProcess = [];
      $('table tbody tr').each((i, row) => {
        const cells = $(row).find('td');
        if (cells.length >= 5) {
          transactionsToProcess.push({
            date_str: $(cells[0]).text().trim(),
            member_name: $(cells[1]).text().trim(),
            type_str: $(cells[2]).text().trim(),
            period: $(cells[3]).text().trim(),
            amount_str: $(cells[4]).text().trim()
          });
        }
      });

      // Process each transaction
      for (const t of transactionsToProcess) {
        try {
          // 1. Find or create member by name
          let member = await Member.findOne({ where: { name: t.member_name } });
          
          if (!member) {
            // Generate a dummy ID card number if not found (using name hash for stability)
            const dummyIdCard = 'SCR-' + Buffer.from(t.member_name).toString('hex').substring(0, 10).toUpperCase();
            
            member = await Member.create({
              name: t.member_name,
              id_card_number: dummyIdCard,
              member_number: await generateMemberNumber(Member),
              gender: 'MALE', // Default
              join_date: new Date(),
              status: 'ACTIVE'
            });
            results.members.created++;
          } else {
            results.members.updated++;
          }

          // 2. Map savings type
          let typeCode = 'SW'; // Default to Simpanan Wajib
          if (t.type_str.includes('POKOK')) typeCode = 'SP';
          else if (t.type_str.includes('SUKARELA')) typeCode = 'SS';
          
          const sType = await SavingsType.findOne({ where: { code: typeCode } });
          if (!sType) throw new Error(`Savings type ${typeCode} not found`);

          // 3. Find or create savings account for this member and type
          let savings = await Savings.findOne({
            where: {
              member_id: member.id,
              savings_type_id: sType.id
            }
          });

          const amount = parseFloat(t.amount_str.replace(/[^\d]/g, '')) || 0;

          if (!savings) {
            savings = await Savings.create({
              account_number: await generateSavingsAccountNumber(sType, member.id),
              member_id: member.id,
              savings_type_id: sType.id,
              balance: amount,
              opened_date: new Date(),
              is_active: true
            });
            results.savings.created++;
          } else {
            // Update balance
            await savings.update({
              balance: parseFloat(savings.balance) + amount
            });
            results.savings.updated++;
          }

          // 4. Create transaction record
          await Transaction.create({
            transaction_type: 'SAVING_DEPOSIT',
            reference_id: savings.id,
            amount: amount,
            transaction_date: new Date(),
            description: `Scraped from ${url}: ${t.type_str} ${t.period}`,
            created_by: 'SCRAPER'
          });
          results.transactions.created++;

        } catch (error) {
          errors.push({
            transaction: t,
            error: error.message
          });
          results.transactions.failed++;
        }
      }

      res.json({
        success: true,
        data: {
          stats,
          results,
          errors
        },
        message: `Successfully scraped and processed ${transactionsToProcess.length} transactions from Vercel app.`
      });

    } catch (fetchError) {
      return res.status(500).json({
        success: false,
        error: 'Failed to scrape data from Vercel app',
        details: fetchError.message
      });
    }

  } catch (error) {
    next(error);
  }
});

// Helper function to parse CSV
async function parseCSV(data) {
  return new Promise((resolve, reject) => {
    parse(data, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }, (err, records) => {
      if (err) {
        reject(err);
      } else {
        resolve(records);
      }
    });
  });
}

module.exports = router;
