const swaggerAutogen = require("swagger-autogen")();


const formatDate = () => {
    const date = new Date();

    const day = String(date.getDate()).padStart(2, "0");        // Get day and pad with 0 if needed
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];                  // Get month name
    const year = date.getFullYear();                            // Get full year               

    const hours = String(date.getHours()).padStart(2, "0");     // Get hours and pad with 0 if needed
    const minutes = String(date.getMinutes()).padStart(2, "0"); // Get minutes and pad with 0 if needed
    const seconds = String(date.getSeconds()).padStart(2, "0"); // Get seconds and pad with 0 if needed

    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
};

const doc = {
    info: {
        title: process.env.SWAGGER_TITLE,
        description: "Generated on " + formatDate(),
    },
    host: process.env.SWAGGER_HOST,
    basePath: "/api", // by default: '/'
    schemes: [],      // by default: ['http']
    consumes: [],     // by default: ['application/json']
    produces: [],     // by default: ['application/json']
    tags: [
        // by default: empty Array
        {
            name: "", // Tag name
            description: "", // Tag description
        },
        // { ... }
    ],
    securityDefinitions: {}, // by default: empty object
    definitions: {}, // by default: empty object
};

const outputFile = "./dist/swagger-output.json";
const routes = ["./src/routes/index.ts"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);
