const Shop = require("../../models/user/shop_model")
const Client = require("../../models/user/client_model")
const { LottoWholesale, LottoRetail } = require('../../models/Lotto/lotto_model')
const { RowLottoWholesale, RowLottoRetail } = require('../../models/Lotto/rowLotto_model')

exports.createShop = async (req, res) => {
    const { _id } = req.user
    const {
        //owner,
        name,
        address,
        phone,
        email,
        type,
        description,
        socials,
        approveRefs,
        bankNumber,
        bankHolder,
        bankProvider,
        bankBranch,
        idCardNumber
    } = req.body
    try {
        if (!_id || !name || !address || address?.trim() === '' || !type) {
            return res.status(400).json({ message: '_id, name, address and type is required or invalid' })
        }
        const duplicatedShop = await Shop.findOne({ name: name })
        if (duplicatedShop) {
            return res.status(400).json({ message: 'Shop name already exists' })
        }

        const existOwner = await Client.findById(_id)
        if (!existOwner) {
            return res.status(400).json({ message: 'owner not found' })
        } else if (existOwner.role === 'user') {
            return res.status(400).json({ message: 'owner not shop owner' })
        }

        const shopLength = await Shop.countDocuments()
        const padCode = (shopLength + 1).toString().padStart(4, '0')
        const shopCodePrefix = 
            type === 'ขายส่ง' ? 'SW-'
            : type === 'ขายปลีก 500' ? 'SR-'
            : type === 'ขายปลีก 500+' ? 'SRR-'
            : 'S?-'

        const code = `${shopCodePrefix}${padCode}`
        const newShop = new Shop({
            code: code,
            owner: _id,
            name: name,
            address: address,
            phone: phone,
            email: email,
            type: type,
            description: description,
            socials: socials,
            approveRefs: approveRefs,
            bankNumber: bankNumber,
            bankHolder: bankHolder,
            bankProvider: bankProvider,
            bankBranch: bankBranch,
            idCardNumber: idCardNumber,
        })

        await newShop.save()
        return res.status(200).json({ 
            message: 'success!',
            status: true,
            data: newShop
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.updateShop = async (req, res) => {
    const { _id } = req.user
    const {
        name,
        address,
        phone,
        email,
        description,
        socials,
        approveRefs,
        bankNumber,
        bankHolder,
        bankProvider,
        bankBranch,
        active,
        status,
        deliveryMethods,
        idCardNumber
    } = req.body
    const { id } = req.params
    try {
        if (!id || !_id) {
            return res.status(400).json({ message: 'id or _id not found' })
        }
        if (!name || !address || address?.trim() === '') {
            return res.status(400).json({ message: 'name, and address is required or invalid' })
        }
        const duplicatedShop = await Shop.findOne({ name: name })
        if (duplicatedShop && duplicatedShop.name !== name) {
            return res.status(400).json({ message: 'Shop name already exists' })
        }

        const existShop = await Shop.findById(id)
        if (!existShop) {
            return res.status(400).json({ message: 'shop not found' })
        } else if (!existShop.active) {
            return res.status(400).json({ message: 'shop not active' })
        } else if (existShop.owner?.toString() !== _id+"") {
            return res.status(400).json({ message: 'shop not owner' })
        }
        const updatedShop = await Shop.findByIdAndUpdate(id, {
            $set: {
                name: name,
                address: address,
                phone: phone,
                email: email,
                active: active,
                status: status,
                description: description,
                socials: socials,
                approveRefs: approveRefs,
                bankNumber: bankNumber,
                bankHolder: bankHolder,
                bankProvider: bankProvider,
                bankBranch: bankBranch,
                status: status,
                idCardNumber: idCardNumber,
                deliveryMethods: deliveryMethods
            }
        }, { new: true })

        if (!updatedShop) {
            return res.status(500).json({ message: "update error!" })
        }

        return res.status(200).json({ 
            message: 'success!',
            status: true,
            //data: updatedShop
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getShops = async (req, res) => {
    const { filter, search, sortBy, sortOrder, page, limit } = req.query;

    try {
        // Initialize query object
        let query = {};

        // Apply filter
        if (filter) {
            switch (filter) {
                case 'isActive':
                    query.active = true;
                    break;
                case 'unActive':
                    query.active = { $ne: true };
                    break;
                case 'isPending':
                    query.status = 'pending';
                    break;
                case 'isApproved':
                    query.status = 'approved';
                    break;
                default:
                    // If the filter is not recognized, return an error
                    return res.status(400).json({ message: 'Invalid filter parameter' });
            }
        }

        // Apply search (example: search by name)
        if (search) {
            query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
        }

        // Set default pagination and sorting options
        const currentPage = parseInt(page) || 1;
        const resultsPerPage = parseInt(limit) || 10;
        const sortField = sortBy || 'createdAt';
        const sortDirection = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination and sorting
        const shops = await Shop.find(query)
            .sort({ [sortField]: sortDirection })
            .skip((currentPage - 1) * resultsPerPage)
            .limit(resultsPerPage);

        // Count total results for pagination
        const totalResults = await Shop.countDocuments(query);

        return res.status(200).json({
            message: 'success!',
            status: true,
            data: shops,
            pagination: {
                currentPage,
                resultsPerPage,
                totalResults,
                totalPages: Math.ceil(totalResults / resultsPerPage)
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
}

exports.getMyShops = async (req, res) => {
    const { _id } = req.user
    const { id } = req.params
    try {
        if (!id || !_id) {
            return res.status(400).json({ message: 'id or _id not found' })
        } else if (id !== _id) {
            return res.status(400).json({ message: 'id not match' })
        }
        const shops = await Shop.find({ owner: id }).select('-__v -password')
        return res.status(200).json({ 
            message: 'success!',
            status: true,
            data: shops
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.getShop = async (req, res) => {
    const { _id } = req.user
    const { id } = req.params
    try {
        if (!id || !_id) {
            return res.status(400).json({ message: 'id or _id not found' })
        }
        const shop = await Shop.findById(id).select('-__v -password')
        if (!shop) {
            return res.status(404).json({ message: 'shop not found' })
        }
        return res.status(200).json({ 
            message: 'success!',
            status: true,
            data: shop
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}

exports.deleteShop = async (req, res) => {
    const { _id } = req.user
    const { id } = req.params
    try {
        if (!id || !_id) {
            return res.status(400).json({ message: 'id or _id not found' })
        }
        const existShop = await Shop.findById(id)
        if (!existShop) {
            return res.status(404).json({ message: 'shop not found' })
        } else if (existShop.owner?.toString() !== _id+"") {
            return res.status(400).json({ message: 'shop not owner' })
        }
        await LottoWholesale.deleteMany({ shop: id, status: { $in: [0, 1, 2]} })
        await LottoRetail.deleteMany({ shop: id, status: { $in: [0, 1, 2]} })
        await RowLottoWholesale.deleteMany({ shop: id, status: { $in: [0, 1, 2]} })
        await RowLottoRetail.deleteMany({ shop: id, status: { $in: [0, 1, 2]} })
        const shop = await Shop.findByIdAndDelete(id)
        if (!shop) {
            return res.status(404).json({ message: 'shop not found' })
        }
        return res.status(200).json({ 
            message: 'shop deleted!',
            status: true
        })
    }
    catch(err) {
        console.log(err)
        return res.status(500).json({ message: err.message })
    }
}