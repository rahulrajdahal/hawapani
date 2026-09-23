/// <reference types="cypress" />

describe("Landing Page E2E Test", () => {
  beforeEach(() => {
    fetchForecast();
  });

  it("should visit the domain url and render landing page texts.", () => {
    cy.get("nav").should("contain.text", "hawapani");
    cy.get("#main-content").should("be.visible");
  });

  it("should toggle temperature scale between Celsius and Fahrenheit", () => {
    cy.get('button[aria-label="Fahrenheit scale"]').first().click();
    cy.window()
      .its("localStorage")
      .invoke("getItem", "hawapani_temp_scale")
      .should("eq", "fahrenheit");

    cy.get('button[aria-label="Celsius scale"]').first().click();
    cy.window()
      .its("localStorage")
      .invoke("getItem", "hawapani_temp_scale")
      .should("eq", "celsius");
  });

  it("should interact with search input", () => {
    cy.get('input[type="search"]').should("be.visible").clear().type("London");
    cy.get('input[type="search"]').should("have.value", "London");
  });

  it("should render current weather and location in hero panel", () => {
    cy.get('section[aria-label="Current Weather Summary"]').should(
      "be.visible",
    );
    cy.contains("The current weather in").should("contain.text", "Kathmandu");
    cy.get('[aria-label="Current temperature: 22 degrees"]').should(
      "be.visible",
    );
    cy.contains("Partly cloudy").should("be.visible");
    cy.contains("10 km/h").should("be.visible");
    cy.contains("65%").should("be.visible");
  });
});

const fetchForecast = () => {
  cy.fixture("forecast.json").then((mockData) => {
    cy.wrap(mockData.data).as("getForecast");
    cy.wrap(mockData.data.currentForecast).as("currentForecast");
    cy.wrap(mockData.data.currentLocation).as("currentLocation");
  });

  cy.intercept("GET", "/api/weather/forecast*", {
    fixture: "forecast.json",
  }).as("getForecastRoute");
  cy.intercept("GET", "/api/weather/search*", { fixture: "search.json" }).as(
    "getSearchRoute",
  );

  cy.visit("/");
  cy.wait("@getForecastRoute");
};
