// // src/App.jsx
// import { Routes, Route } from "react-router-dom";
// import Layout from "./components/Layout";
// import VendorWiseReturnForm from "./forms/VendorWiseReturnForm";
// import ReturnItemsListPage from "./components/ReturnItemsListPage";
// import ViewReturnItemPage from "./pages/ViewReturnItemPage";
// import ItemWiseReturnForm from "./forms/ItemWiseReturnForm";
// import AdvanceReceiptForm from "./forms/AdvanceReceiptForm";
// import BulkPaymentForm from "./forms/BulkPaymentForm";
// import GRCWisePaymentForm from "./forms/GRCWisePaymentForm";
// import CounterSaleForm from "./forms/CounterSaleForm";
// import SellItemsListPage from "./pages/SellItemsListPage";
// import IndoorSaleForm from "./forms/IndoorSaleForm";
// import SaleReturnForm from "./forms/SaleReturnForm";
// import SellReturnListPage from "./pages/SellReturnListPage";
// import AddEditVendorSupplier from "./forms/AddEditVendorSupplier";
// import VendorList from "./pages/VendorList";
// import AddEditManufacturer from "./forms/AddEditManufacturer.jsx";
// import ManufacturerList from "./pages/ManufacturerList.jsx";
// import AddEditGeneric from "./forms/AddEditGeneric.jsx";
// import GenericList from "./pages/GenericList.jsx";
// import AddEditItemMedicine from "./forms/AddEditItemMedicine.jsx"; // New import
// import ItemMedicineList from "./pages/ItemMedicineList.jsx"; // New import
// import AddEditPurchase from "./forms/AddEditPurchase";
// import PurchaseList from "./pages/PurchaseList";
// import PurchaseDetails from "./pages/PurchaseDetails";
// import ItemMedicineDetails from "./pages/ItemMedicineDetails";
// import BulkPurchaseEntry from "./forms/BulkPurchaseEntry";
// import ViewCounterSaleItem from "./pages/ViewCounterSaleItem";
// import ViewIndoorSale from "./pages/ViewIndoorSale";
// import IndoorSalesList from "./pages/IndoorSalesList";
// import Dashboard from "./components/Dashboard";
// import PrintInvoice from "./components/counterbill";
// import PrintIndoorInvoice from "./components/PrintIndoorInvoice";
// import PrintPurchase from "./components/PrintPurchase";
// import ItemReturnList from "./pages/ItemReturnList";
// import IndoorBulkPayment from "./components/IndoorBulkPayment";
// function App() {
//   return (
//     <Layout>
//       <Routes>
//         <Route
//           path="/sale-return-details/:id"
//           element={<ViewReturnItemPage />}
//         />
//         <Route path="/return-items-list" element={<ReturnItemsListPage />} />
//         <Route path="/vendor-return" element={<VendorWiseReturnForm />} />
//         <Route path="/advance-receipt" element={<AdvanceReceiptForm />} />
//         <Route path="/bulk-payment" element={<BulkPaymentForm />} />
//         <Route path="/grc-payment" element={<GRCWisePaymentForm />} />
//         <Route path="/counter-sale" element={<CounterSaleForm />} />
//         <Route path="/indoor-sale" element={<IndoorSaleForm />} />
//         <Route path="/sale-return" element={<SaleReturnForm />} />
//         <Route path="/view-sale-returns" element={<SellReturnListPage />} />
//         <Route path="/vendor" element={<AddEditVendorSupplier />} />
//         <Route path="/vendor-list" element={<VendorList />} />
//         <Route
//           path="/vendors/edit/:vendorId"
//           element={<AddEditVendorSupplier />}
//         />
//         <Route path="/manufacturer-list" element={<ManufacturerList />} />
//         <Route path="/manufacturer" element={<AddEditManufacturer />} />
//         <Route
//           path="/manufacturers/edit/:manufacturerId"
//           element={<AddEditManufacturer />}
//         />
//         <Route path="/generic-list" element={<GenericList />} />
//         <Route path="/generic" element={<AddEditGeneric />} />
//         <Route path="/generics/edit/:genericId" element={<AddEditGeneric />} />
//         <Route path="/additems-list" element={<ItemMedicineList />} />
//         <Route path="/" element={<AddEditItemMedicine />} />
//         <Route path="/items/edit/:itemId" element={<AddEditItemMedicine />} />
//         <Route path="/purchases-data" element={<AddEditPurchase />} />
//         <Route
//           path="/purchases/edit/:purchaseId"
//           element={<AddEditPurchase />}
//         />
//         <Route path="/purchases-list" element={<PurchaseList />} />
//         <Route
//           path="/purchases/view/:purchaseId"
//           element={<PurchaseDetails />}
//         />
//         <Route path="/items/view/:itemId" element={<ItemMedicineDetails />} />
//         <Route path="/bulk-purchases" element={<BulkPurchaseEntry />} />
//         <Route
//           path="/counter-sale-details/:id"
//           element={<ViewCounterSaleItem />}
//         />
//         <Route path="/view-indoor-sale/:saleId" element={<ViewIndoorSale />} />
//         <Route path="/view-counter-sales" element={<SellItemsListPage />} />
//         <Route path="/indoor-sales-list" element={<IndoorSalesList />} />
//         <Route path="/daaa" element={<Dashboard />} />
//         <Route path="/counter-bill/:id" element={<PrintInvoice />} />
//         <Route path="/print-indoor/:id" element={<PrintIndoorInvoice />} />
//         <Route path="/print-purchase/:purchaseId" element={<PrintPurchase />} />
//         <Route path="/return-list" element={<ItemReturnList />} />
//         <Route path="/return-form" element={<ItemWiseReturnForm />} />
//         {/* Route for editing an existing return document */}
//         <Route
//           path="/return-form/:documentId"
//           element={<ItemWiseReturnForm />}
//         />
//         <Route path="/return-list" element={<ItemReturnList />} />
//         <Route path="/indoor-bulk-payment" element={<IndoorBulkPayment />} />
//       </Routes>
//     </Layout>
//   );
// }

// export default App;



// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import VendorWiseReturnForm from "./forms/VendorWiseReturnForm";
import ReturnItemsListPage from "./components/ReturnItemsListPage";
import ViewReturnItemPage from "./pages/ViewReturnItemPage";
import ItemWiseReturnForm from "./forms/ItemWiseReturnForm";
import AdvanceReceiptForm from "./forms/AdvanceReceiptForm";
import BulkPaymentForm from "./forms/BulkPaymentForm";
import GRCWisePaymentForm from "./forms/GRCWisePaymentForm";
import CounterSaleForm from "./forms/CounterSaleForm";
import SellItemsListPage from "./pages/SellItemsListPage";
import IndoorSaleForm from "./forms/IndoorSaleForm";
import SaleReturnForm from "./forms/SaleReturnForm";
import SellReturnListPage from "./pages/SellReturnListPage";
import AddEditVendorSupplier from "./forms/AddEditVendorSupplier";
import VendorList from "./pages/VendorList";
import AddEditManufacturer from "./forms/AddEditManufacturer.jsx";
import ManufacturerList from "./pages/ManufacturerList.jsx";
import AddEditGeneric from "./forms/AddEditGeneric.jsx";
import GenericList from "./pages/GenericList.jsx";
import AddEditItemMedicine from "./forms/AddEditItemMedicine.jsx";
import ItemMedicineList from "./pages/ItemMedicineList.jsx";
import AddEditPurchase from "./forms/AddEditPurchase";
import PurchaseList from "./pages/PurchaseList";
import PurchaseDetails from "./pages/PurchaseDetails";
import ItemMedicineDetails from "./pages/ItemMedicineDetails";
import BulkPurchaseEntry from "./forms/BulkPurchaseEntry";
import ViewCounterSaleItem from "./pages/ViewCounterSaleItem";
import ViewIndoorSale from "./pages/ViewIndoorSale";
import IndoorSalesList from "./pages/IndoorSalesList";
import Dashboard from "./components/Dashboard";
import PrintInvoice from "./components/counterbill";
import PrintIndoorInvoice from "./components/PrintIndoorInvoice";
import PrintPurchase from "./components/PrintPurchase";
import ItemReturnList from "./pages/ItemReturnList";
import IndoorBulkPayment from "./components/IndoorBulkPayment";
import BulkPaymentHistory from './pages/BulkPaymentHistory';
import GRCPaymentHistory from './pages/GRCPaymentHistory';
import PrintPaymentVoucher from './components/GCRPaymentVoucher';
import BulkPaymentVoucher from './components/BulkPaymentVoucher';
import VendorWiseReturnVoucher from "./components/VendorWiseReturnVoucher";
import PrintIndoorBulk from './components/PrintIndoorBulk';
import SaleReturnVoucher from './components/SaleReturnVoucher';
import VendorReturnList from "./pages/VendorReturnList";
import ItemWiseReturnVoucher from "./components/ItemWiseReturnVoucher";

function App() {
  return (
    <Layout>
      <Routes>
        <Route
          path="/sale-return-details/:id"
          element={<ViewReturnItemPage />}
        />
        <Route path="/return-items-list" element={<ReturnItemsListPage />} />
        <Route path="/vendor-return" element={<VendorWiseReturnForm />} />
        <Route path="/advance-receipt" element={<AdvanceReceiptForm />} />
        <Route path="/bulk-payment" element={<BulkPaymentForm />} />
        <Route path="/grc-payment" element={<GRCWisePaymentForm />} />
        <Route path="/counter-sale" element={<CounterSaleForm />} />
        <Route path="/indoor-sale" element={<IndoorSaleForm />} />
        {/* NEW ROUTE ADDED HERE */}
        <Route path="/indoor-sale/pay/:saleId" element={<IndoorSaleForm />} />
        <Route path="/sale-return" element={<SaleReturnForm />} />
        <Route path="/view-sale-returns" element={<SellReturnListPage />} />
        <Route path="/vendor" element={<AddEditVendorSupplier />} />
        <Route path="/vendor-list" element={<VendorList />} />
        <Route
          path="/vendors/edit/:vendorId"
          element={<AddEditVendorSupplier />}
        />
        <Route path="/manufacturer-list" element={<ManufacturerList />} />
        <Route path="/manufacturer" element={<AddEditManufacturer />} />
        <Route
          path="/manufacturers/edit/:manufacturerId"
          element={<AddEditManufacturer />}
        />
        <Route path="/generic-list" element={<GenericList />} />
        <Route path="/generic" element={<AddEditGeneric />} />
        <Route path="/generics/edit/:genericId" element={<AddEditGeneric />} />
        <Route path="/additems-list" element={<ItemMedicineList />} />
        <Route path="/AddEditItemMedicine" element={<AddEditItemMedicine />} />
        <Route path="/items/edit/:itemId" element={<AddEditItemMedicine />} />
        <Route path="/purchases-data" element={<AddEditPurchase />} />
        <Route
          path="/purchases/edit/:purchaseId"
          element={<AddEditPurchase />}
        />
        <Route path="/purchases-list" element={<PurchaseList />} />
        <Route
          path="/purchases/view/:purchaseId"
          element={<PurchaseDetails />}
        />
        <Route path="/items/view/:itemId" element={<ItemMedicineDetails />} />
        <Route path="/bulk-purchases" element={<BulkPurchaseEntry />} />
        <Route
          path="/counter-sale-details/:id"
          element={<ViewCounterSaleItem />}
        />
        <Route path="/view-indoor-sale/:saleId" element={<ViewIndoorSale />} />
        <Route path="/view-counter-sales" element={<SellItemsListPage />} />
        <Route path="/indoor-sales-list" element={<IndoorSalesList />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/print-bill/:id" element={<PrintInvoice />} />
        <Route path="/print-indoor/:id" element={<PrintIndoorInvoice />} />
        <Route path="/print-purchase/:purchaseId" element={<PrintPurchase />} />
        <Route path="/return-list" element={<ItemReturnList />} />
        <Route path="/return-form" element={<ItemWiseReturnForm />} />
        <Route
          path="/return-form/:documentId"
          element={<ItemWiseReturnForm />}
        />
        <Route path="/return-list" element={<ItemReturnList />} />
        <Route path="/indoor-bulk-payment" element={<IndoorBulkPayment />} />
        <Route path="/bulk-payment-history" element={<BulkPaymentHistory />} />
        <Route path="/grc-payment-history" element={<GRCPaymentHistory />} />
        <Route path="/print-payment-voucher/:id" element={<PrintPaymentVoucher />} />
        <Route path="/print-bulk-voucher/:id" element={<BulkPaymentVoucher />} />
        <Route path="/vendor-return-voucher" element={<VendorWiseReturnVoucher />} />
        <Route path="/print-indoor-bulk/:id" element={<PrintIndoorBulk />} />
        <Route path="/sale-return-voucher/:id" element={<SaleReturnVoucher />} />
         <Route path="/vendor-return-list" element={<VendorReturnList />} />
         <Route path="/item-return-voucher" element={<ItemWiseReturnVoucher />} />
      </Routes>
    </Layout>
  );
}

export default App;