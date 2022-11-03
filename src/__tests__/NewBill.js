/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

jest.mock("../app/store", () => mockStore);

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

      test("Then a correct image format (.jpg, .jpeg, .png) has been selected", () => {
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
        const file = new File(["img"], "img.jpg", { type: "image/jpg" });
        // File upload simulation
        userEvent.upload(fileInput, file);
        // Check if handleChangeFile has been called
        expect(handleChangeFile).toHaveBeenCalled();
        // Check is an window alert has not been called
        expect(window.alert).not.toHaveBeenCalled();
        expect(fileInput.files[0]).toStrictEqual(file);
      });

      test("Then an alert is raised if an incorrect image format has been selected", async () => {
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

//Integration tests : POST
describe("Given I am a user connected as Employee", () => {
  describe("When I submit a new bill", () => {
    test("Then a new bill is created", async () => {
      // Set document body
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      // Set localStorage item (key : "type", keyValue : "Employee", key : "email", keyValue : "a@a")
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      // Set mock bill object
      const mockedBill = {
        type: "IT et électronique",
        name: "PC",
        date: "2022-11-03",
        amount: 348,
        vat: 70,
        pct: 20,
        commentary: "Comment",
        fileUrl: "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=4df6ed2c-12c8-42a2-b013-346c1346f732",
        fileName: "preview-facture-free-201801-pdf-1.jpg",
        status: "pending",
      };

      // Set new bill values
      screen.getByTestId("expense-type").value = mockedBill.type;
      screen.getByTestId("expense-name").value = mockedBill.name;
      screen.getByTestId("datepicker").value = mockedBill.date;
      screen.getByTestId("amount").value = mockedBill.amount;
      screen.getByTestId("vat").value = mockedBill.vat;
      screen.getByTestId("pct").value = mockedBill.pct;
      screen.getByTestId("commentary").value = mockedBill.commentary;
      newBill.fileName = mockedBill.fileName;
      newBill.fileUrl = mockedBill.fileUrl;

      newBill.updateBill = jest.fn();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      // Set element to monitor
      const form = screen.getByTestId("form-new-bill");
      // Set event listener
      form.addEventListener("submit", handleSubmit);
      // Simulate form submission (new bill)
      fireEvent.submit(form);
      // Check if handleSubmit has been called
      expect(handleSubmit).toHaveBeenCalled();
      // Check if updateBill has been called
      expect(newBill.updateBill).toHaveBeenCalled();
    });
    describe("When an error occurs on API", () => {
      test("fetches error from an API and fails with 500 error", async () => {
        jest.spyOn(mockStore, "bills");
        jest.spyOn(console, "error").mockImplementation(() => { });

        // Set localStorage value
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        // Set localStorage value
        Object.defineProperty(window, "location", {
          value: { hash: ROUTES_PATH["NewBill"] },
        });
        // Set localStorage item (key : "type", keyValue : "Employee")
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );

        // Set document body content
        document.body.innerHTML = `<div id="root"></div>`;

        // Initialize router
        router();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        mockStore.bills.mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Set DOM element
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        // Set event listener
        form.addEventListener("submit", handleSubmit);
        // Simulate form submission
        fireEvent.submit(form);
        await new Promise(process.nextTick);
        // Check if console.error has been called
        expect(console.error).toHaveBeenCalled();
      });
    });
  });
});