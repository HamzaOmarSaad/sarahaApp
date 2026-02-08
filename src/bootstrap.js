import express from "express";
const Bootstrap = async () => {
  const app = express();
  const PORT = 3000;

  //invalid routing
  app.use("{/dummy}", (req, res) => {
    return res.status(404).json({ message: "invalid path" });
  });

  // error handling
  app.use((error, reg, res, next) => {
    return res.status(error?.cause?.status || 500).json({
      message: "somthing went wrong " + error.message,
    });
  });
  app.listen(PORT, () => console.log("app running on port " + PORT));
};
export default Bootstrap;
