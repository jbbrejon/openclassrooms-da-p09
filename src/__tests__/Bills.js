/**
 * @jest-environment jsdom
 */
import "bootstrap";
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      // Expect function with "toHaveClass" jest-dom matcher
      expect(windowIcon).toHaveClass("active-icon");

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
    test("Then the modale is opened when I click on the eye icon", async () => {
      // Set localStorage object
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      // Set localStorage item (key: type, value: "Eployee" )
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      document.body.innerHTML = BillsUI({ data: bills });

      const store = null;
      const employeeBills = new Bills({
        document,
        onNavigate,
        store,
        bills,
        localStorage: window.localStorage,
      });
      // Set DOM element
      const eye = screen.getAllByTestId("icon-eye")[0];
      const handleClickIconEye = jest.fn(employeeBills.handleClickIconEye);
      // Set event listener
      eye.addEventListener("click", () => handleClickIconEye(eye));
      // Simulate click event
      userEvent.click(eye);
      // Set timer (time for modale to open)
      let i = 0;
      while (
        !document.querySelector("#modaleFile").classList.contains("show") &&
        i < 10
      ) {
        await new Promise((r) => setTimeout(r, 100));
        i++;
      }
      // Check if handleClickIconEye has been called
      expect(handleClickIconEye).toHaveBeenCalled();
      // Check if modale has "show" class
      expect(document.querySelector("#modaleFile")).toHaveClass("show");
    });
  })
})

// Integration tests : GET
describe("Given I am a user connected as Employee", () => {
  describe("When I navigate to Bills", () => {
    test("fetches bills from mock API GET", async () => {
      // Set localStorage item (key: type, value : "Employee"; key: email : a@a)
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      // DOM elements
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // Initialize router
      router();
      // Navigate to Bills page
      window.onNavigate(ROUTES_PATH.Bills);
      document.body.innerHTML = BillsUI({ data: bills });
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const contentPending = screen.getByText("pending");
      expect(contentPending).toBeTruthy();
      const contentAccepted = screen.getByText("accepted");
      expect(contentAccepted).toBeTruthy();
      expect(screen.getAllByTestId("icon-eye")).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        // Set localStorage item (key: type, value : "Employee"; key: email : a@a)
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
            email: "a@a",
          })
        );
        // DOM elements
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        // Initialize router
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});