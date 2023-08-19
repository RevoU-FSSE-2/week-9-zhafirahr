const express = require('express')
const connections = require('./config/db')
const bodyParser = require('body-parser')

const app = express()

// Middleware
app.use(bodyParser.json())

const ports = 3000

// Start server
app.listen(ports, () => {
    console.log(`Server listening at http://localhost:${ports}`);
});

// Common Response
const commonResponse = function (data, error) {
    if (error) {
        return {
            success: false,
            error: 'An error occurred while fetching user information'
        }
    }
    return {
        success: true,
        data: data
    }
}

app.get('/user/:id', (request, response) => {
    const userId = request.params.id;
    const sql = 'SELECT users.id, name, address, ' +
        'SUM(CASE WHEN type="income" THEN amount ELSE 0 END) AS total_income, ' +
        'SUM(CASE WHEN type="expense" THEN amount ELSE 0 END) AS total_expense ' +
        'FROM users ' +
        'LEFT JOIN transactions ON users.id = transactions.user_id ' +
        'WHERE users.id = ? ' +
        'GROUP BY users.id';
    dbConnect.query(sql, userId, (err, result, fields) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Error"))
            response.end()
            return
        }
        const userData = {
            id: result[0].id,
            name: result[0].name,
            address: result[0].address,
            balance: result[0].total_income - result[0].total_expense,
            expense: result[0].total_expense
        }
        response.status(200).json(commonResponse(userData, null))
        response.end()
    })

})

// POST /transaction for add new transaction
app.post('/transaction', (request, response) => {
    const { user_id, type, amount } = request.body;
    const sql = 'INSERT INTO transactions (user_id, type, amount) VALUES (?, ?, ?)';
    dbConnect.query(sql, [user_id, type, amount], (err, result, fields) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Error"))
            response.end()
            return
        }
        response.status(200).json({ message: 'Transaction added successfully', id: result.insertId })
        response.end()
    })
})

// PUT /transactions/:id for update transaction
app.put('/transaction/:id', (request, response) => {
    const transactionId = request.params.id;
    const { type, amount } = request.body;
    const sql = 'UPDATE transactions SET type = ?, amount = ? WHERE id = ?';

    dbConnect.query(sql, [type, amount, transactionId], (err) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Error"))
            response.end()
            return
        }
        response.status(200).json({ message: 'Transaction updated successfully' })
        response.end()
    })
})

// DELETE /transactions/:id for delete transaction
app.delete('/transaction/:id', (request, response) => {
    const transactionId = request.params.id;
    const sql = 'DELETE FROM transactions WHERE id = ?';

    dbConnect.query(sql, [transactionId], (err) => {
        if (err) {
            response.status(500).json(commonResponse(null, "Server Error"))
            response.end()
            return
        }
        response.status(200).json({ message: 'Transaction deleted successfully' })
        response.end()
    })
})

