const { LottoWholesale, LottoRetail } = require('../models/Lotto/lotto_model')
const dayjs = require('dayjs')
require("dayjs/locale/th")
const buddhistEra = require("dayjs/plugin/buddhistEra");
 
dayjs.extend(buddhistEra)
dayjs.locale("th")

const thisYear = dayjs(new Date()).format('BB')

const decode = (code) => {
    const arr = code.split('-')
    return arr
}

exports.createLottosWholesale = async (req, res) => {
    const { 
        codes,
        qty,
        shop,
        price
    } = req.body
    try {

        const duplicateLottos = await LottoWholesale.find({ code: { $in: codes } })
        const duplicateCodes = duplicateLottos.map(lotto => lotto.code)
        let conflictCount = 0

        const createdCodes = codes.map((code) => {
            const decoded = decode(code)
            const period = decoded[1]
            const set = decoded[2]
            const numbers = decoded[3]
            const number = numbers.split('')
            let conflict = false

            if (duplicateCodes.includes(code)) {
                conflict = true
                conflictCount++
            }

            const newData = {
                code: code,
                period: period, // งวดที่
                set: set, // ชุดที่
                qty: qty, // จำนวนชุด
                number: number, // เลข 6 หลัก
                shop: shop, // ร้านค้า
                conflict: conflict,
                price: price
            }

            return newData
        })
        
        await LottoWholesale.insertMany(createdCodes)

        return res.status(200).json({
            message: "success",
            status: true,
            amount: createdCodes.length,
            conflict: conflictCount
        })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}

exports.getLottosWholesale = async (req, res) => {
    const { filter, search, sortBy, sortOrder, page, limit } = req.query;
    try {
        // Initialize query object
        let query = {
            status: 'selling',
            conflict: false,
            period: thisYear
        };

        // Apply filter
        if (filter) {
            switch (filter) {
                case 'isOrdering':
                    query.status = 'ordering';
                    break;
                case 'isSold':
                    query.status = 'sold';
                    break;
                case 'isConflict':
                    query.conflict = true;
                    break;
                default:
                    // If the filter is not recognized, return an error
                    return res.status(400).json({ message: 'Invalid filter parameter' });
            }
        }

        // Apply search (example: search by name)
        if (search) {
            query.code = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        // Set default pagination and sorting options
        const currentPage = parseInt(page) || 1;
        const resultsPerPage = parseInt(limit) || 10;
        const sortField = sortBy || 'createdAt';
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination and sorting
        const lottos = await LottoWholesale.find(query)
            .sort({ [sortField]: sortDirection })
            .skip((currentPage - 1) * resultsPerPage)
            .limit(resultsPerPage);

        // Count total results for pagination
        const totalResults = await LottoWholesale.countDocuments(query);

        return res.status(200).json({
            message: 'success!',
            status: true,
            data: lottos,
            pagination: {
                currentPage,
                resultsPerPage,
                totalResults,
                totalPages: Math.ceil(totalResults / resultsPerPage)
            }
        });
    }
    catch (err) {
        console.log(err)
        return res.status(500).json(err.message)
    }
}