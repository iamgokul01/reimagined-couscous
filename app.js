const express = require("express");
const app = express();
app.use(express.json());
let isValid = require("date-fns/isValid");
let parse = require("date-fns/parse");
let parseISO = require("date-fns/parseISO");
let format = require("date-fns/format");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let dbPath = path.join(__dirname, "/todoApplication.db");
let db = null;

const startServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Started");
    });
  } catch (error) {
    console.log(error.mesage);
  }
};

startServer();

const validateData = (request, response, next) => {
  try {
    let {
      priority = "",
      status = "",
      category = "",
      todo = "",
      date = "",
    } = request.query;

    let parseDate = parse(date, "yyyy-MM-dd", new Date());
    console.log(parseDate);
    let date_str = format(parseDate, "yyyy-MM-dd");
    console.log(date_str);
    console.log(isValid(date_str))
   

    

    let hasPriority =
      priority === "HIGH" ||
      priority === "MEDIUM" ||
      priority === "LOW" ||
      priority === "";

    let hasStatus =
      status === "TO DO" ||
      status === "IN PROGRESS" ||
      status === "DONE" ||
      status === "";

    let hasCategory =
      category === "WORK" ||
      category === "HOME" ||
      category === "LEARNING" ||
      category === "";

    if (hasPriority) {
      if (hasStatus) {
        if (hasCategory) {
          if (isValid(parseDate) || date === "") {
            next();
          } else {
            console.log("elseblcok");
            response.status(400);
            response.send("Invalid Due Date");
          }
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Priority");
    }
  } catch (error) {
    console.log(error.message);
  }
};

app.get("/todos", validateData, async (request, response) => {
  let { priority = "", status = "", category = "", todo = "" } = request.query;

  let fetchQuery = `
  select * from todo where
  priority like '%${priority}%' and
  todo like '%${todo}%' and
  status like '%${status}%' and
  category like '%${category}%' ;
  `;

  let dbResponse = await db.all(fetchQuery);
  response.send(dbResponse);
});

app.get("/todos/:todoId", validateData, async (request, response) => {
  let { todoId } = request.params;
  let fetchDataQuery = `
  select * from todo where id = ${todoId};
  `;

  let dbRes = await db.get(fetchDataQuery);
  response.send(dbRes);
});

app.get("/agenda", async (request, response) => {
  let { date } = request.query;
  let dataQuery = `
    select * from todo where due_date = '${date}';
    `;

  let dbRes = await db.get(dataQuery);
  response.send(dbRes);
});

app.post("/todos", async (request, response) => {
  let { id, todo, priority, status, category, dueDate } = request.body;

  let addQuery = `
    insert into todo values(
        ${id},'${todo}','${priority}','${status}','${category}','${dueDate}'
    );`;

  let dbRes = await db.run(addQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId", async (request, response) => {
  let { id, todo, priority, status, category, dueDate } = request.body;

  let { todoId } = request.params;
});

app.put("todos/:todoId", async (request, response) => {
  let { todoId } = request.params;
  response.send("Hello");
  let { status, priority, todo, category, dueDate } = request.body;

  console.log(status, todo);
});
