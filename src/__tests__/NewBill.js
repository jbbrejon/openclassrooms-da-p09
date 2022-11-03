/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { screen, waitFor } from "@testing-library/dom";



describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    // Jest hook "beforeEach : common setup for all tests"
    beforeEach(() => {
      // Set localStorage value
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      // Set localStorage item (key : "type", keyValue : "Employee")
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // Set root element of document body
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Initialize router
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    test("Then mail icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon).toHaveClass("active-icon");
    });
  })
})
