import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

// Dummy data for users, restaurants, menu items, orders, etc.
const dummyUsers = [
  { firstName: "John", lastName: "Doe", email: "john.doe@example.com", username: "johndoe", password: "password123" },
  { firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", username: "janesmith", password: "password123" },
  { firstName: "Michael", lastName: "Johnson", email: "michael.johnson@example.com", username: "michaeljohnson", password: "password123" },
  { firstName: "Sarah", lastName: "Brown", email: "sarah.brown@example.com", username: "sarahbrown", password: "password123" },
  { firstName: "David", lastName: "Williams", email: "david.williams@example.com", username: "davidwilliams", password: "password123" },
  { firstName: "Emma", lastName: "Davis", email: "emma.davis@example.com", username: "emmadavis", password: "password123" },
  { firstName: "James", lastName: "Miller", email: "james.miller@example.com", username: "jamesmiller", password: "password123" },
  { firstName: "Sophia", lastName: "Wilson", email: "sophia.wilson@example.com", username: "sophiawilson", password: "password123" },
  { firstName: "Daniel", lastName: "Moore", email: "daniel.moore@example.com", username: "danielmoore", password: "password123" },
  { firstName: "Olivia", lastName: "Taylor", email: "olivia.taylor@example.com", username: "oliviataylor", password: "password123" },
];

const dummyRestaurants = [
  { name: "Tasty Bites", city: "New York", country: "USA", deliveryPrice: 2.5, estimatedTime: "30 minutes", cuisines: "Italian" },
  { name: "Burger King", city: "Los Angeles", country: "USA", deliveryPrice: 3, estimatedTime: "25 minutes", cuisines: "Fast Food" },
  { name: "Sushi World", city: "San Francisco", country: "USA", deliveryPrice: 5, estimatedTime: "40 minutes", cuisines: "Japanese" },
  { name: "Pasta House", city: "Chicago", country: "USA", deliveryPrice: 3, estimatedTime: "35 minutes", cuisines: "Italian" },
  { name: "Green Veggies", city: "Boston", country: "USA", deliveryPrice: 4, estimatedTime: "20 minutes", cuisines: "Vegetarian" },
  { name: "Spicy Chicken", city: "Miami", country: "USA", deliveryPrice: 2, estimatedTime: "30 minutes", cuisines: "Indian" },
  { name: "BBQ Grill", city: "Houston", country: "USA", deliveryPrice: 3, estimatedTime: "45 minutes", cuisines: "BBQ" },
  { name: "Noodle Soup", city: "Seattle", country: "USA", deliveryPrice: 2.5, estimatedTime: "25 minutes", cuisines: "Chinese" },
  { name: "Curry Delight", city: "Las Vegas", country: "USA", deliveryPrice: 4, estimatedTime: "40 minutes", cuisines: "Indian" },
  { name: "Pizza Palace", city: "San Diego", country: "USA", deliveryPrice: 3, estimatedTime: "20 minutes", cuisines: "Italian" },
];

const dummyMenuItems = [
  { name: "Margherita Pizza", price: 12, category: "Pizza", options: "Regular Size", imagePath: "image.jpg" },
  { name: "Cheeseburger", price: 8, category: "Burger", options: "Single", imagePath: "image.jpg" },
  { name: "Sushi Rolls", price: 15, category: "Sushi", options: "Assorted", imagePath: "image.jpg" },
  { name: "Spaghetti Carbonara", price: 10, category: "Pasta", options: "Standard", imagePath: "image.jpg" },
  { name: "Vegetarian Salad", price: 7, category: "Salad", options: "Large", imagePath: "image.jpg" },
  { name: "Butter Chicken", price: 14, category: "Curry", options: "Medium", imagePath: "image.jpg" },
  { name: "BBQ Ribs", price: 18, category: "BBQ", options: "Full Rack", imagePath: "image.jpg" },
  { name: "Egg Noodles", price: 9, category: "Noodles", options: "Large", imagePath: "image.jpg" },
  { name: "Chicken Tikka", price: 13, category: "Curry", options: "Medium", imagePath: "image.jpg" },
  { name: "Pepperoni Pizza", price: 14, category: "Pizza", options: "Regular Size", imagePath: "image.jpg" },
];

const dummyOrders = [
  { totalAmount: 50.0, status: "pending" },
  { totalAmount: 30.0, status: "completed" },
  { totalAmount: 40.0, status: "pending" },
  { totalAmount: 45.0, status: "completed" },
  { totalAmount: 25.0, status: "pending" },
  { totalAmount: 60.0, status: "completed" },
  { totalAmount: 35.0, status: "completed" },
  { totalAmount: 55.0, status: "pending" },
  { totalAmount: 70.0, status: "completed" },
  { totalAmount: 20.0, status: "pending" },
];

const dummyReviews = [
  { rating: 5, comment: "Amazing food!" },
  { rating: 4, comment: "Very good, would order again." },
  { rating: 3, comment: "Decent, but could be better." },
  { rating: 5, comment: "Best meal I've had!" },
  { rating: 2, comment: "Not great, I expected more." },
  { rating: 4, comment: "Good service and food." },
  { rating: 3, comment: "Average experience." },
  { rating: 5, comment: "Fantastic! Highly recommend." },
  { rating: 4, comment: "Good, but a bit expensive." },
  { rating: 5, comment: "I loved it!" },
];

async function main() {
  const fixedHash = "$2b$10$GntmgabDaCU3OpVxSohaUeGWE.2ea9d4sZAmcHf/TSTBIITX5ZfF6";
  // Hash the user passwords and create users
  const hashedUsers = dummyUsers.map((user) => ({
    ...user,
    password: fixedHash,
  }));

  // Create users in the database
  const createdUsers = await Promise.all(
    hashedUsers.map(async (user) => {
      return await prisma.user.create({
        data: user,
      });
    })
  );

  // Create restaurants and link them with the users
  const createdRestaurants = await Promise.all(
    dummyRestaurants.map(async (restaurant, index) => {
      return await prisma.restaurant.create({
        data: {
          ...restaurant,
          ownerId: createdUsers[index % createdUsers.length].id, // Each user owns a restaurant
        },
      });
    })
  );

  // Create menu items and link them to restaurants
  const createdMenuItems = await Promise.all(
    dummyMenuItems.map(async (menuItem, index) => {
      return await prisma.menuItem.create({
        data: {
          ...menuItem,
          restaurantId: createdRestaurants[index % createdRestaurants.length].id, // Link menu items to restaurants
        },
      });
    })
  );

  // Create orders and link them to users and restaurants
  const createdOrders = await Promise.all(
    dummyOrders.map(async (order, index) => {
      return await prisma.order.create({
        data: {
          ...order,
          userId: createdUsers[index % createdUsers.length].id, // Link orders to users
          restaurantId: createdRestaurants[index % createdRestaurants.length].id, // Link orders to restaurants
        },
      });
    })
  );

  // Create order items and link them to orders and menu items
  const createdOrderItems = await Promise.all(
    dummyOrders.map(async (order, orderIndex) => {
      return await prisma.orderItem.create({
        data: {
          orderId: createdOrders[orderIndex].id,
          menuItemId: createdMenuItems[orderIndex % createdMenuItems.length].id, // Link order items to menu items
          quantity: 1,
          price: createdMenuItems[orderIndex % createdMenuItems.length].price,
        },
      });
    })
  );

  // Create reviews and link them to users and restaurants
  const createdReviews = await Promise.all(
    dummyReviews.map(async (review, index) => {
      return await prisma.review.create({
        data: {
          ...review,
          userId: createdUsers[index % createdUsers.length].id, // Link reviews to users
          restaurantId: createdRestaurants[index % createdRestaurants.length].id, // Link reviews to restaurants
        },
      });
    })
  );

  console.log("Database has been seeded with dummy data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
