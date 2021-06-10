const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const db = require("./db");
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/test", (req, res) => {
  db.addNewIngredient("Tomato", 3, res);
});

app.get("/ingredients", db.getAllIngredients);
app.post("/ingredients", (req, res) => {
  db.addNewIngredient(req.body.name, req.body.category, res);
});

app.get("/ingredients/:typeId", (req, res) => {
  db.getIngredientsByType(req.params.typeId).then((result) =>
    res.send(result.rows)
  );
});

app.get("/reset", (req, res) => {
  db.resetDB();
  res.send("Database reset");
});

app.get("/recipes/:id", (req, res) => {
  db.getRecipeById(req.params.id)
    .then((result) => res.send(result.rows))
    .catch((err) => console.log(err));
});

app.get("/directions/:id", (req, res) => {
  db.getRecipeDirectionsById(req.params.id)
    .then((result) => res.send(result.rows))
    .catch((err) => console.log(err));
});

app.get("/directions", (req, res) => {
  db.getAllDirections().then((result) => res.send(result.rows));
});

app.get("/recipes", (req, res) => {
  db.getAllRecipes().then((result) => res.send(result.rows));
});

app.get("/recipes/users/:userId", (req, res) => {
  db.getRecipesByUserId(req.params.userId).then((result) => res.send(result.rows));
})

app.get("/categories", (req, res) => {
  db.getCategories().then((result) => res.status(200).send(result.rows));
});

app.get("/categories/:id", (req, res) => {
  db.getRecipesByCat(req.params.id).then((result) =>
    res.status(200).send(result.rows)
  );
});

app.get("/users/", (req, res) => {
  db.getUserByEmail(req.query.email).then((result) => {
    if(result.rows.length) {
      res.status(200).send(result.rows);
    } else {
      res.json([{error: "User doesn't exist"}]);
    }
  }).catch(err => console.log(err));
})

app.post("/users/", (req, res) => {
  db.addNewUser(req.body.email, req.body.name);
  res.status(200).send("Succesfully Added new user");
})

app.post("/recipes", (req, res) => {
  db.addNewRecipe(req.body.name, req.body.leftovers, req.body.userId).then((res) => {
    db.getLastRecipeId().then((res) => {
      if (res.rows[0].id) {
        for (const item of req.body.ingredients) {
          db.updateIngredientList(
            res.rows[0].id,
            item.ingredient,
            item.measurement
          );
          for (const item of req.body.directions) {
            db.updateDirections(res.rows[0].id, item);
          }
        }
      }
    });
  });
});

app.delete("/recipes/:id", (req, res) => {
  db.deleteRecipe(req.params.id);
  res.status(200).send("Successfully deleted recipe");
})

app.get("/food_types", (req, res) => {
  db.getFoodTypes().then((result) => res.status(200).send(result.rows));
});

app.listen(PORT, () => {
  console.log("Server started listening on port " + PORT);
});