/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import NewBill from "../containers/NewBill.js";
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
    // Check mail icon status
    test("Then mail icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      // Check if mail icon has the .active-icon class
      expect(mailIcon).toHaveClass("active-icon");
    });

    describe("When I upload a file", () => {
      // Check file upload control
      test("Then an alert is raised if an unaccepted image format has been uploaded", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const employeeNewBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
        // Spy on window alerts
        jest.spyOn(window, "alert").mockImplementation(() => { });
        // Set input element
        const fileInput = screen.getByTestId("file");
        const handleChangeFile = jest.fn(employeeNewBill.handleChangeFile);
        // Set event listener (file upload)
        fileInput.addEventListener("change", (e) => handleChangeFile(e));
        // Set file pattern
        const file = new File(["img"], "img.webp", { type: "image/webp" });
        // File upload simulation
        userEvent.upload(fileInput, file);
        // Check if handleChangeFile has been called
        expect(handleChangeFile).toHaveBeenCalled();
        // Check is an window alert has been called
        expect(window.alert).toHaveBeenCalled();
      });
    });
  })
})
