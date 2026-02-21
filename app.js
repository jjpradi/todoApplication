const express = require('express')

const app = express()

const {open} = require('sqlite')

const {format, parseISO} = require('date-fns')

const sqlite3 = require('sqlite3')

const path = require('path')

const dbpath = path.join(__dirname, 'todoApplication.db')
app.use(express.json())
let db
const initializaDbAndServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('server start running at http://localhost:3000'),
    )
  } catch (e) {
    console.log(`DB error :${e}`)
  }
}

initializaDbAndServer()
const convertToCamel = db => {
  if (db.length == 0) {
    return {
      id: db.id,
      todo: db.todo,
      category: db.category,
      priority: db.priority,
      status: db.status,
      dueDate: db.due_date,
    }
  } else {
    return db.map(e => ({
      id: e.id,
      todo: e.todo,
      category: e.category,
      priority: e.priority,
      status: e.status,
      dueDate: e.due_date,
    }))
  }
}
const checkValidity = async (request, response, next) => {
  let status, category, priority
  if (typeof request.body == 'object' && Object.keys(request.body).length > 0) {
    ;({status, category, priority} = request.body)
  } else {
    ;({status, priority, category} = request.query)
  }

  const prioritylist = ['LOW', 'HIGH', 'MEDIUM']

  const statusList = ['TO DO', 'IN PROGRESS', 'DONE']

  const categorylist = ['WORK', 'HOME', 'LEARNING']

  if (status != undefined && !statusList.includes(status)) {
    response.send('Invalid Status')
    response.status(400)
    return
  } else if (priority !== undefined && !prioritylist.includes(priority)) {
    response.send(400)
    response.status('Invalid priority')
    return
  } else if (category !== undefined && !categorylist.includes(category)) {
    response.send(400)
    response.status('invalid Category')
  } else {
    next()
  }
}

app.get('/todos', checkValidity, async (request, response) => {
  const {status, priority, category} = request.query
  const dbQuery = () => {
    switch (true) {
      case status !== undefined:
        return `select * from  todo where status ='${status}'`
      case priority !== undefined:
        return `select * from todo where priority='${priority}'`

      case priority !== undefined && status !== undefined:
        return `select * from todo where priority='${priority}' and status='${status}'`

      case search_q !== undefined:
        return `select * from todo where  todo like '%${search_q}%' `
      case category !== undefined && status !== undefined:
        return `select * from todo where category='${category}' and status='${status}'`

      case category !== undefined:
        return `select * from todo where category='${category}'`
      case category !== undefined && priority !== undefined:
        return `select * from todo where category='${category}' and priority='${priority}'`
    }
  }

  const dbResponse = await db.all(dbQuery())
  return response.json(convertToCamel(dbResponse))
})

app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const dbQuery = `select *  from todo where id=${todoId}`

  const dbResponse = await db.get(dbQuery)
  response.send(convertToCamel(dbResponse))
})

app.get('/agenda/', async (request, response) => {
  const {date} = request.query

  const newDate = Date.parse(date)
  const formattedDate = format(newDate, 'dd-MM-yyyy')

  const dbQuery = `select * from todo where due_date='${formattedDate}'`

  const dbResponse = await db.all(dbQuery)
  response.send(dbResponse)
})

app.post('/todos', checkValidity, async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body

  const dbQuery = `insert into todo(id,todo,priority,status,category,due_date) values ${id},'${todo}','${priority}','${status}','${category}',
'${dueDate}'
`

  const dbResponse = await db.run(dbQuery)
  response.send('Todo Successfully Added')
})

app.put('/todos', checkValidity, async (request, response) => {
  const {status, priority, category} = request.body

  const dbQuery = () => {
    switch (true) {
      case status !== undefined:
        return [
          'Status',
          `update todo set status='${status}' where id=${todoId}`,
        ]
      case priority !== undefined:
        return [
          'Priority',
          `update todo set priority='${priority}' where id=${todoId}`,
        ]

      case category !== undefined:
        return [
          'Category',
          `update todo set category='${category}' where id=${todoId}`,
        ]
      case dueDate !== undefined:
        return [
          'Due Date',
          `update  todo set due_date='${dueDate}' where id=${todoId}`,
        ]
    }
  }

  const val = dbQuery()
  const newVal = val[0]
  const dbResponse = await db.run(val[1])
  response.send(`${newVal} updated`)
})

app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const dbQuery = `drop todo where id=${todoId}`

  const dbResponse = await db.run(dbQuery)
  response.send('Todo Deleted')
})

module.exports = app
