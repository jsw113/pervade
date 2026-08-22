"use client";

import { useState, useEffect } from "react";
import {
  Package,
  ArrowDownRight,
  ArrowUpRight,
  AlertTriangle,
  RefreshCw,
  Plus,
  Minus,
  History,
  Check,
  X,
  Truck,
  ShoppingCart,
  Building2,
  FileSpreadsheet,
  Receipt,
  ExternalLink,
  Search,
  Filter,
  Layers,
  Upload,
  Edit2,
  Trash2,
  Sparkles,
  DollarSign,
  Boxes,
  CheckCircle2,
  Clock,
  Send
} from "lucide-react";

export default function AdminInventoryPage() {
  const [activeTab, setActiveTab] = useState<"FINISHED" | "CHANNEL_ORDERS" | "MATERIALS" | "PARTNERS" | "LEDGER">("FINISHED");
  
  // Data states
  const [products, setProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [channelOrders, setChannelOrders] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [financialStats, setFinancialStats] = useState<any>({
    totalSalesAmount: 0,
    totalPurchaseAmount: 0,
    netRevenue: 0,
    estimatedVatPayable: 0,
    issuedCount: 0,
    unissuedCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Tab 1: Product In/Out Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [adjustType, setAdjustType] = useState<"IN" | "OUT" | "ADJUST">("OUT");
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustPartner, setAdjustPartner] = useState("");
  const [adjustChannel, setAdjustChannel] = useState("ONLINE_MALL");
  const [adjustUnitPrice, setAdjustUnitPrice] = useState<number>(0);
  const [adjustTaxStatus, setAdjustTaxStatus] = useState("NOT_APPLICABLE");
  const [adjustTaxNumber, setAdjustTaxNumber] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab 2: Channel Orders State & Modals
  const [orderChannelFilter, setOrderChannelFilter] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isBatchUploadModalOpen, setIsBatchUploadModalOpen] = useState(false);
  const [batchChannel, setBatchChannel] = useState("NAVER");
  const [batchTextData, setBatchTextData] = useState("");
  
  // New Manual Order Form
  const [newOrderForm, setNewOrderForm] = useState({
    channel: "OFFLINE",
    productName: "퍼베이드 올인원 프리미엄 다목적 세정제 500ml (본품)",
    quantity: 1,
    unitPrice: 18900,
    buyerName: "",
    buyerPhone: "",
    shippingAddress: "",
    shippingCarrier: "CJ대한통운",
    trackingNumber: "",
    taxInvoiceStatus: "UNISSUED",
    memo: "",
  });

  // Tracking Number Edit Modal
  const [editingOrder, setEditingOrder] = useState<any | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [carrierInput, setCarrierInput] = useState("CJ대한통운");

  // Tab 3: Materials Form State
  const [isNewMaterialModalOpen, setIsNewMaterialModalOpen] = useState(false);
  const [materialInModal, setMaterialInModal] = useState<any | null>(null);
  const [materialInQty, setMaterialInQty] = useState<number>(100);
  const [materialTaxNumber, setMaterialTaxNumber] = useState("");
  const [newMaterialForm, setNewMaterialForm] = useState({
    name: "",
    category: "CONTAINER",
    unit: "개",
    currentStock: 1000,
    safetyStock: 200,
    unitCost: 500,
    supplierName: "",
  });

  // Tab 4: Partner Form State
  const [isNewPartnerModalOpen, setIsNewPartnerModalOpen] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState({
    name: "",
    type: "SALES",
    channelType: "ONLINE_MALL",
    bizNumber: "",
    ceoName: "",
    contact: "",
    email: "",
    address: "",
    memo: "",
  });

  // Tab 5: Tax Invoice Approval Number Modal
  const [editingTaxItem, setEditingTaxItem] = useState<{ id: string; targetType: string; currentNumber?: string } | null>(null);
  const [taxNumberInput, setTaxNumberInput] = useState("");

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1. Finished Products & Logs
      const invRes = await fetch("/api/admin/inventory");
      if (invRes.ok) {
        const data = await invRes.json();
        setProducts(data.products || []);
        setLogs(data.logs || []);
      }

      // 2. Channel Orders
      const orderRes = await fetch("/api/admin/channel-orders");
      if (orderRes.ok) {
        const data = await orderRes.json();
        setChannelOrders(data || []);
      }

      // 3. Raw Materials
      const matRes = await fetch("/api/admin/materials");
      if (matRes.ok) {
        const data = await matRes.json();
        setMaterials(data || []);
      }

      // 4. Partners
      const partRes = await fetch("/api/admin/partners");
      if (partRes.ok) {
        const data = await partRes.json();
        setPartners(data || []);
      }

      // 5. Tax Invoices & Financial Stats
      const taxRes = await fetch("/api/admin/tax-invoices");
      if (taxRes.ok) {
        const data = await taxRes.json();
        if (data.stats) setFinancialStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch ERP data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Open Finished Goods Adjustment Modal
  const openAdjustModal = (product: any, defaultType: "IN" | "OUT" | "ADJUST" = "OUT") => {
    setSelectedProduct(product);
    setAdjustType(defaultType);
    setAdjustQty(1);
    setAdjustUnitPrice(product.price || 18900);
    setAdjustPartner(defaultType === "OUT" ? "네이버 스마트스토어" : "(주)한국보틀");
    setAdjustChannel(defaultType === "OUT" ? "ONLINE_MALL" : "SUPPLIER");
    setAdjustTaxStatus(defaultType === "OUT" ? "NOT_APPLICABLE" : "UNISSUED");
    setAdjustTaxNumber("");
    setAdjustReason(
      defaultType === "OUT"
        ? "네이버 스마트스토어 판매 출고"
        : defaultType === "IN"
        ? "본사 공장 완제품 입고"
        : "재고 실사 수량 정정"
    );
    setIsAdjustModalOpen(true);
  };

  // Submit Finished Goods Stock Adjustment
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!adjustReason.trim()) {
      alert("사유를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          type: adjustType,
          quantity: adjustQty,
          reason: adjustReason,
          partnerName: adjustPartner,
          channelType: adjustChannel,
          unitPrice: adjustUnitPrice,
          totalAmount: adjustUnitPrice * adjustQty,
          taxInvoiceStatus: adjustTaxStatus,
          taxInvoiceNumber: adjustTaxNumber,
        }),
      });

      if (res.ok) {
        alert("재고 및 거래 이력이 성공적으로 저장되었습니다.");
        setIsAdjustModalOpen(false);
        fetchAllData();
      } else {
        alert("재고 처리에 실패했습니다.");
      }
    } catch (err: any) {
      alert("오류 발생: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Manual Channel Order
  const handleNewOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.buyerName.trim()) {
      alert("주문자(구매자)명을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/channel-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrderForm),
      });

      if (res.ok) {
        alert("수기 주문이 등록되었으며, 완제품 재고가 자동으로 차감되었습니다.");
        setIsNewOrderModalOpen(false);
        fetchAllData();
      } else {
        alert("주문 등록에 실패했습니다.");
      }
    } catch (err: any) {
      alert("오류 발생: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Batch Upload from CSV / Excel Text
  const handleBatchUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchTextData.trim()) {
      alert("엑셀 데이터나 CSV 텍스트를 붙여넣어주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse CSV or TSV (Tab Separated copied from Excel)
      const lines = batchTextData.trim().split("\n");
      if (lines.length === 0) return;

      const delimiter = lines[0].includes("\t") ? "\t" : ",";
      const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^"|"$/g, ""));

      const ordersToUpload = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const row = lines[i].split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""));
        const item: any = {};
        headers.forEach((h, idx) => {
          item[h] = row[idx] || "";
        });

        // Smart field mapping
        ordersToUpload.push({
          productName: item["상품명"] || item["주문상품"] || item["productName"] || "퍼베이드 올인원 프리미엄 다목적 세정제 500ml (본품)",
          quantity: parseInt(item["수량"] || item["quantity"] || 1),
          unitPrice: parseInt(item["판매가"] || item["단가"] || item["결제금액"] || 18900),
          totalPrice: parseInt(item["총결제금액"] || item["합계"] || item["totalPrice"] || 18900),
          buyerName: item["주문자명"] || item["구매자명"] || item["buyerName"] || "외부몰 고객",
          buyerPhone: item["주문자연락처"] || item["구매자연락처"] || item["buyerPhone"] || "010-0000-0000",
          receiverName: item["수취인명"] || item["수령인"] || item["receiverName"] || item["주문자명"] || "고객",
          receiverPhone: item["수취인연락처"] || item["수령인연락처"] || item["receiverPhone"] || "010-0000-0000",
          shippingAddress: item["배송지"] || item["기본배송지"] || item["주소"] || item["shippingAddress"] || "서울시",
          channelOrderNo: item["주문번호"] || item["channelOrderNo"] || `${batchChannel}-${Date.now()}-${i}`,
          trackingNumber: item["송장번호"] || item["운송장번호"] || item["trackingNumber"] || "",
        });
      }

      const res = await fetch("/api/admin/channel-orders/batch-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: batchChannel,
          orders: ordersToUpload,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`총 ${data.successCount}건의 주문이 성공적으로 등록되고 재고가 일괄 차감되었습니다!`);
        setIsBatchUploadModalOpen(false);
        setBatchTextData("");
        fetchAllData();
      } else {
        alert("일괄 업로드 실패: " + (data.error || ""));
      }
    } catch (err: any) {
      alert("오류 발생: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Tracking Number (CJ Logistics)
  const handleUpdateTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const res = await fetch("/api/admin/channel-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingOrder.id,
          trackingNumber: trackingInput,
          shippingCarrier: carrierInput,
          status: trackingInput ? "SHIPPED" : editingOrder.status,
        }),
      });

      if (res.ok) {
        alert("CJ대한통운 운송장번호가 업데이트되었습니다.");
        setEditingOrder(null);
        fetchAllData();
      } else {
        alert("송장번호 수정 실패");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create Partner
  const handleNewPartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerForm.name.trim()) return;

    try {
      const res = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPartnerForm),
      });

      if (res.ok) {
        alert("거래처가 성공적으로 등록되었습니다.");
        setIsNewPartnerModalOpen(false);
        setNewPartnerForm({
          name: "",
          type: "SALES",
          channelType: "ONLINE_MALL",
          bizNumber: "",
          ceoName: "",
          contact: "",
          email: "",
          address: "",
          memo: "",
        });
        fetchAllData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Raw Material Inbound Stock
  const handleMaterialInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialInModal) return;

    try {
      const res = await fetch("/api/admin/materials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: materialInModal.id,
          type: "IN",
          quantity: materialInQty,
          reason: `[매입 입고] ${materialInModal.supplierName || "원재료 매입처"}로부터 입고`,
          supplierName: materialInModal.supplierName,
          taxInvoiceNumber: materialTaxNumber,
        }),
      });

      if (res.ok) {
        alert("원재료 입고가 완료되었으며 매입 거래원장에 등록되었습니다.");
        setMaterialInModal(null);
        fetchAllData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Create Raw Material
  const handleNewMaterialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialForm.name.trim()) return;

    try {
      const res = await fetch("/api/admin/materials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMaterialForm),
      });

      if (res.ok) {
        alert("신규 원재료/부자재가 등록되었습니다.");
        setIsNewMaterialModalOpen(false);
        setNewMaterialForm({
          name: "",
          category: "CONTAINER",
          unit: "개",
          currentStock: 1000,
          safetyStock: 200,
          unitCost: 500,
          supplierName: "",
        });
        fetchAllData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Save Tax Invoice Approval Number
  const handleSaveTaxNumber = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTaxItem) return;

    try {
      const res = await fetch("/api/admin/tax-invoices", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingTaxItem.id,
          targetType: editingTaxItem.targetType,
          taxInvoiceStatus: "ISSUED",
          taxInvoiceNumber: taxNumberInput,
        }),
      });

      if (res.ok) {
        alert("전자세금계산서 승인번호가 등록되고 [발행완료] 처리되었습니다.");
        setEditingTaxItem(null);
        setTaxNumberInput("");
        fetchAllData();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Filtered Channel Orders
  const filteredOrders = channelOrders.filter((order) => {
    if (orderChannelFilter !== "ALL" && order.channel !== orderChannelFilter) return false;
    if (orderSearch) {
      const q = orderSearch.toLowerCase();
      return (
        order.buyerName?.toLowerCase().includes(q) ||
        order.productName?.toLowerCase().includes(q) ||
        order.channelOrderNo?.toLowerCase().includes(q) ||
        order.trackingNumber?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalFinishedStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter((p) => p.stock <= p.safetyStock).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Header & Financial Overview Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
              Integrated ERP &amp; SCM
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1 text-zinc-950">
            통합 재고 &amp; 옴니채널 주문(네이버/쿠팡/CJ택배) &amp; 세금계산서 ERP
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            자사몰, 네이버, 쿠팡, 오프라인 매출 및 원재료 매입처, CJ대한통운 송장, 전자세금계산서를 유기적으로 통합 관리합니다.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAllData}
          disabled={loading}
          className="px-4 py-2 bg-white border rounded-xl text-xs font-bold text-zinc-700 hover:bg-zinc-50 transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          데이터 동기화
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold">완제품 총 재고</span>
            <Package className="w-4 h-4 text-zinc-600" />
          </div>
          <p className="text-xl font-black text-zinc-950">{totalFinishedStock.toLocaleString()}개</p>
          <p className="text-[10px] text-zinc-500">
            {lowStockCount > 0 ? (
              <span className="text-red-600 font-bold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" /> 안전재고 미달 {lowStockCount}건
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">안전재고 정상 유지</span>
            )}
          </p>
        </div>

        <div className="bg-white p-4 rounded-2xl border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold">옴니채널 주문 건수</span>
            <ShoppingCart className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-blue-600">{channelOrders.length}건</p>
          <p className="text-[10px] text-zinc-500">네이버·쿠팡·오프라인 통합</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold">총 매출 거래액</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-700">
            ₩{financialStats.totalSalesAmount?.toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-500">온/오프라인 누적 매출</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold">원재료/제조 매입액</span>
            <Boxes className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-black text-amber-800">
            ₩{financialStats.totalPurchaseAmount?.toLocaleString()}
          </p>
          <p className="text-[10px] text-zinc-500">용기·원료·패키지 매입</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border shadow-xs space-y-1">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-bold">세금계산서 미발행</span>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-rose-600">{financialStats.unissuedCount}건</p>
          <p className="text-[10px] text-zinc-500">
            발행완료 {financialStats.issuedCount}건
          </p>
        </div>
      </div>

      {/* 2. Top Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("FINISHED")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "FINISHED"
              ? "bg-zinc-950 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border"
          }`}
        >
          <Package className="w-4 h-4" />
          1. 완제품 재고 현황 &amp; 빠른 입출고
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("CHANNEL_ORDERS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "CHANNEL_ORDERS"
              ? "bg-zinc-950 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border"
          }`}
        >
          <Truck className="w-4 h-4 text-amber-500" />
          2. 옴니채널 주문 &amp; CJ택배 배송 (네이버/쿠팡/수기)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("MATERIALS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "MATERIALS"
              ? "bg-zinc-950 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border"
          }`}
        >
          <Boxes className="w-4 h-4" />
          3. 원재료 &amp; 부자재 매입 수불부
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("PARTNERS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "PARTNERS"
              ? "bg-zinc-950 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border"
          }`}
        >
          <Building2 className="w-4 h-4" />
          4. 매출처 &amp; 원재료 매입처 관리
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("LEDGER")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "LEDGER"
              ? "bg-zinc-950 text-white shadow-sm"
              : "bg-white text-zinc-600 hover:bg-zinc-100 border"
          }`}
        >
          <Receipt className="w-4 h-4 text-emerald-500" />
          5. 전자세금계산서 &amp; 통합 거래원장
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: FINISHED GOODS INVENTORY                                            */}
      {/* ========================================================================= */}
      {activeTab === "FINISHED" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => {
              const isLowStock = product.stock <= product.safetyStock;
              return (
                <div key={product.id} className="bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex gap-4 items-start">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-contain bg-zinc-50 border shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-amber-700">
                        <span className="px-1.5 py-0.5 bg-amber-50 rounded border border-amber-200">{product.category}</span>
                        <span>{product.subCategory}</span>
                      </div>
                      <h3 className="font-bold text-sm text-zinc-900 line-clamp-1">{product.name}</h3>
                      <p className="text-xs font-extrabold text-zinc-950">₩{product.price?.toLocaleString()}원</p>
                    </div>
                  </div>

                  <div className="bg-zinc-50 p-3.5 rounded-xl border flex justify-between items-center">
                    <div>
                      <span className="text-[11px] text-zinc-500 font-bold block">현재 가용 재고</span>
                      <span className={`text-xl font-black ${isLowStock ? "text-red-600" : "text-zinc-900"}`}>
                        {product.stock?.toLocaleString()} <span className="text-xs font-normal text-zinc-500">개</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">안전재고 기준</span>
                      <span className="text-xs font-bold text-zinc-600">{product.safetyStock}개</span>
                    </div>
                  </div>

                  {/* Quick In/Out buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => openAdjustModal(product, "IN")}
                      className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-emerald-200"
                    >
                      <Plus className="w-3.5 h-3.5" /> 입고
                    </button>
                    <button
                      type="button"
                      onClick={() => openAdjustModal(product, "OUT")}
                      className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-rose-200"
                    >
                      <Minus className="w-3.5 h-3.5" /> 출고
                    </button>
                    <button
                      type="button"
                      onClick={() => openAdjustModal(product, "ADJUST")}
                      className="px-3 py-2 bg-zinc-100 text-zinc-700 hover:bg-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors border"
                    >
                      실사 정정
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recent Finished Product Movement Logs */}
          <div className="bg-white rounded-2xl border p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <History className="w-4 h-4 text-zinc-500" />
                완제품 최근 입출고 이력
              </h3>
              <span className="text-xs text-zinc-400">최근 50건 표시</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 text-zinc-600 border-b font-bold">
                  <tr>
                    <th className="p-3">일시</th>
                    <th className="p-3">상품명</th>
                    <th className="p-3">구분</th>
                    <th className="p-3">수량</th>
                    <th className="p-3">최종재고</th>
                    <th className="p-3">거래처 / 채널</th>
                    <th className="p-3">단가 및 거래액</th>
                    <th className="p-3">사유</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-zinc-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50">
                      <td className="p-3 text-zinc-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-3 font-bold text-zinc-900">{log.product?.name || "퍼베이드 상품"}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            log.type === "IN"
                              ? "bg-emerald-100 text-emerald-800"
                              : log.type === "OUT"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-zinc-100 text-zinc-800"
                          }`}
                        >
                          {log.type === "IN" ? "입고" : log.type === "OUT" ? "출고" : "실사"}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{log.type === "OUT" ? `-${log.quantity}` : `+${log.quantity}`}개</td>
                      <td className="p-3 font-bold text-zinc-900">{log.balance}개</td>
                      <td className="p-3 text-zinc-600 font-medium">{log.partnerName || log.channelType || "-"}</td>
                      <td className="p-3 font-medium text-zinc-900">
                        {log.totalAmount ? `₩${log.totalAmount.toLocaleString()}` : "-"}
                      </td>
                      <td className="p-3 text-zinc-600">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: 🛒 옴니채널 주문 & CJ택배 배송 관리                                    */}
      {/* ========================================================================= */}
      {activeTab === "CHANNEL_ORDERS" && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-zinc-500">채널 필터:</span>
              {["ALL", "NAVER", "COUPANG", "ZASAMALL", "B2B", "OFFLINE"].map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => setOrderChannelFilter(ch)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    orderChannelFilter === ch ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  }`}
                >
                  {ch === "ALL" ? "전체 채널" : ch === "NAVER" ? "네이버" : ch === "COUPANG" ? "쿠팡" : ch === "ZASAMALL" ? "자사몰" : ch === "B2B" ? "B2B도매" : "오프라인"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBatchUploadModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                네이버/쿠팡 엑셀 일괄 업로드
              </button>

              <button
                type="button"
                onClick={() => setIsNewOrderModalOpen(true)}
                className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                수기 주문 등록
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="주문자명, 상품명, 주문번호, CJ대한통운 운송장번호 검색..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
          </div>

          {/* Channel Orders Table */}
          <div className="bg-white rounded-2xl border shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 text-zinc-600 border-b font-bold">
                  <tr>
                    <th className="p-3.5">주문일시 / 채널</th>
                    <th className="p-3.5">주문번호</th>
                    <th className="p-3.5">상품명 및 수량</th>
                    <th className="p-3.5">결제금액</th>
                    <th className="p-3.5">주문자 / 배송지</th>
                    <th className="p-3.5">배송상태</th>
                    <th className="p-3.5">CJ대한통운 운송장번호</th>
                    <th className="p-3.5">세금계산서</th>
                    <th className="p-3.5 text-center">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-zinc-700">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const cjTrackingUrl = order.trackingNumber
                        ? `https://www.doortodoor.co.kr/parcel/doortodoor.do?f_param=search&invc_no=${order.trackingNumber.replace(/[^0-9]/g, "")}`
                        : null;

                      return (
                        <tr key={order.id} className="hover:bg-zinc-50/80">
                          <td className="p-3.5 whitespace-nowrap space-y-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                order.channel === "NAVER"
                                  ? "bg-green-100 text-green-800"
                                  : order.channel === "COUPANG"
                                  ? "bg-rose-100 text-rose-800"
                                  : order.channel === "B2B"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-zinc-100 text-zinc-800"
                              }`}
                            >
                              {order.channel}
                            </span>
                            <div className="text-[11px] text-zinc-400">
                              {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                            </div>
                          </td>

                          <td className="p-3.5 font-mono text-[11px] text-zinc-500">{order.channelOrderNo || "-"}</td>

                          <td className="p-3.5">
                            <span className="font-bold text-zinc-900 block line-clamp-1">{order.productName}</span>
                            <span className="text-zinc-500 font-semibold">{order.quantity}개</span>
                          </td>

                          <td className="p-3.5 font-extrabold text-zinc-950 whitespace-nowrap">
                            ₩{order.totalPrice?.toLocaleString()}
                          </td>

                          <td className="p-3.5 space-y-0.5">
                            <span className="font-bold text-zinc-900 block">{order.buyerName}</span>
                            <span className="text-[11px] text-zinc-400 block line-clamp-1">{order.shippingAddress || "직접수령"}</span>
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                order.status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.status === "SHIPPED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {order.status === "DELIVERED" ? "배송완료" : order.status === "SHIPPED" ? "배송중" : "배송준비"}
                            </span>
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            {order.trackingNumber ? (
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-zinc-900">{order.trackingNumber}</span>
                                {cjTrackingUrl && (
                                  <a
                                    href={cjTrackingUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded border border-amber-200 text-[10px] font-bold inline-flex items-center gap-0.5"
                                    title="CJ대한통운 실시간 배송추적"
                                  >
                                    CJ조회 <ExternalLink className="w-2.5 h-2.5" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOrder(order);
                                  setTrackingInput("");
                                }}
                                className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 rounded text-[11px] font-bold text-zinc-600"
                              >
                                + CJ송장 입력
                              </button>
                            )}
                          </td>

                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                order.taxInvoiceStatus === "ISSUED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.taxInvoiceStatus === "UNISSUED"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              {order.taxInvoiceStatus === "ISSUED"
                                ? "발행완료"
                                : order.taxInvoiceStatus === "UNISSUED"
                                ? "미발행"
                                : "영세/카드"}
                            </span>
                          </td>

                          <td className="p-3.5 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingOrder(order);
                                setTrackingInput(order.trackingNumber || "");
                                setCarrierInput(order.shippingCarrier || "CJ대한통운");
                              }}
                              className="p-1.5 hover:bg-zinc-100 rounded text-zinc-500 hover:text-zinc-950"
                              title="송장/상태 수정"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-zinc-400">
                        등록된 주문 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: 🧪 원재료 & 부자재 매입 수불부                                      */}
      {/* ========================================================================= */}
      {activeTab === "MATERIALS" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-xs">
            <div>
              <h2 className="text-base font-bold text-zinc-950">원재료 &amp; 부자재 수불 현황</h2>
              <p className="text-xs text-zinc-500 mt-0.5">공병 용기, 트리거 스프레이, 계면활성제 원료, 포장 패키지 매입 재고</p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewMaterialModalOpen(true)}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> 신규 원재료 품목 등록
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materials.map((mat) => {
              const isLow = mat.currentStock <= mat.safetyStock;
              return (
                <div key={mat.id} className="bg-white rounded-2xl border p-5 shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold">
                        {mat.category === "CONTAINER" ? "용기/공병" : mat.category === "SPRAY" ? "스프레이 건" : mat.category === "RAW_INGREDIENT" ? "천연원료" : "패키지/박스"}
                      </span>
                      <h3 className="font-bold text-sm text-zinc-950 mt-1">{mat.name}</h3>
                      <p className="text-[11px] text-zinc-400">매입처: {mat.supplierName || "미지정"}</p>
                    </div>
                    <span className="text-xs font-black text-amber-700">단가 ₩{mat.unitCost?.toLocaleString()}</span>
                  </div>

                  <div className="bg-zinc-50 p-3.5 rounded-xl border flex justify-between items-center">
                    <div>
                      <span className="text-[11px] text-zinc-500 font-bold block">현재 보유 재고</span>
                      <span className={`text-xl font-black ${isLow ? "text-red-600" : "text-zinc-950"}`}>
                        {mat.currentStock?.toLocaleString()} <span className="text-xs font-normal text-zinc-500">{mat.unit}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 block">안전재고</span>
                      <span className="text-xs font-bold text-zinc-600">{mat.safetyStock}{mat.unit}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setMaterialInModal(mat);
                      setMaterialInQty(500);
                      setMaterialTaxNumber("");
                    }}
                    className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> 매입 입고 등록 (+재고 증가 &amp; 세금계산서 연동)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 🏢 매출처 & 원재료 매입처 관리                                      */}
      {/* ========================================================================= */}
      {activeTab === "PARTNERS" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border shadow-xs">
            <div>
              <h2 className="text-base font-bold text-zinc-950">온/오프라인 매출처 및 원재료 매입처 마스터</h2>
              <p className="text-xs text-zinc-500 mt-0.5">네이버, 쿠팡, 도매 유통처, 원료/용기 제조사 및 사업자 세금계산서 정보</p>
            </div>
            <button
              type="button"
              onClick={() => setIsNewPartnerModalOpen(true)}
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> 신규 거래처 등록
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <div key={partner.id} className="bg-white rounded-2xl border p-5 shadow-xs space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        partner.type === "SALES"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {partner.type === "SALES" ? "매출처 (판매채널)" : "매입처 (원자재/제조)"}
                    </span>
                    <h3 className="font-bold text-sm text-zinc-950">{partner.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-400">{partner.channelType}</span>
                </div>

                <div className="space-y-1 text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border">
                  {partner.bizNumber && <p><strong>사업자번호:</strong> {partner.bizNumber}</p>}
                  {partner.ceoName && <p><strong>대표자:</strong> {partner.ceoName}</p>}
                  {partner.contact && <p><strong>연락처:</strong> {partner.contact}</p>}
                  {partner.email && <p><strong>계산서이메일:</strong> {partner.email}</p>}
                </div>

                {partner.memo && <p className="text-[11px] text-zinc-500 line-clamp-2">💡 {partner.memo}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: 🧾 전자세금계산서 & 통합 거래원장                                     */}
      {/* ========================================================================= */}
      {activeTab === "LEDGER" && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-zinc-950">전자세금계산서 발행 관리 &amp; 통합 거래원장</h2>
                <p className="text-xs text-zinc-500 mt-0.5">매출 세금계산서 발행, 매입 세금계산서 수취 승인번호 관리 및 정산 집계</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-50 text-zinc-600 border-b font-bold">
                  <tr>
                    <th className="p-3.5">거래일시</th>
                    <th className="p-3.5">구분</th>
                    <th className="p-3.5">거래처명</th>
                    <th className="p-3.5">품목 및 사유</th>
                    <th className="p-3.5">수량</th>
                    <th className="p-3.5">공급가액 / 거래총액</th>
                    <th className="p-3.5">세금계산서 상태</th>
                    <th className="p-3.5">전자세금계산서 승인번호</th>
                    <th className="p-3.5 text-center">승인번호 관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-zinc-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50/80">
                      <td className="p-3.5 text-zinc-400 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleDateString("ko-KR")}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            log.type === "OUT"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {log.type === "OUT" ? "매출 출고" : "매입 입고"}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-zinc-900">{log.partnerName || log.channelType || "-"}</td>
                      <td className="p-3.5 text-zinc-600">{log.reason}</td>
                      <td className="p-3.5 font-semibold">{log.quantity}개</td>
                      <td className="p-3.5 font-black text-zinc-950">
                        {log.totalAmount ? `₩${log.totalAmount.toLocaleString()}` : "-"}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            log.taxInvoiceStatus === "ISSUED"
                              ? "bg-emerald-100 text-emerald-800"
                              : log.taxInvoiceStatus === "UNISSUED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {log.taxInvoiceStatus === "ISSUED"
                            ? "발행완료"
                            : log.taxInvoiceStatus === "UNISSUED"
                            ? "미발행"
                            : "영세/카드"}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-zinc-600">
                        {log.taxInvoiceNumber || "-"}
                      </td>
                      <td className="p-3.5 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaxItem({ id: log.id, targetType: "INVENTORY_LOG", currentNumber: log.taxInvoiceNumber || "" });
                            setTaxNumberInput(log.taxInvoiceNumber || "");
                          }}
                          className="px-2.5 py-1 bg-zinc-900 text-white hover:bg-zinc-800 rounded text-[10px] font-bold"
                        >
                          승인번호 등록
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FINISHED GOODS ADJUSTMENT MODAL                                  */}
      {/* ========================================================================= */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Stock Movement</span>
                <h3 className="text-lg font-black text-zinc-950">{selectedProduct.name} 재고 처리</h3>
              </div>
              <button type="button" onClick={() => setIsAdjustModalOpen(false)} className="text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {(["OUT", "IN", "ADJUST"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setAdjustType(t);
                      setAdjustReason(t === "OUT" ? "네이버 스마트스토어 판매 출고" : t === "IN" ? "본사 공장 완제품 입고" : "재고 실사 정정");
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      adjustType === t ? "bg-zinc-950 text-white border-zinc-950" : "bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    {t === "OUT" ? "판매 / 출고" : t === "IN" ? "생산 / 입고" : "실사 수량 정정"}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">처리 수량 (개) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">단가 (원)</label>
                  <input
                    type="number"
                    value={adjustUnitPrice}
                    onChange={(e) => setAdjustUnitPrice(parseInt(e.target.value) || 0)}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-sm font-bold text-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">매출처 / 매입처 선택</label>
                <select
                  value={adjustPartner}
                  onChange={(e) => setAdjustPartner(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                >
                  <option value="네이버 스마트스토어">네이버 스마트스토어</option>
                  <option value="쿠팡 윙/로켓">쿠팡 윙/로켓</option>
                  <option value="성수동 팝업스토어">성수동 팝업스토어</option>
                  <option value="리빙셀렉트 B2B 도매">리빙셀렉트 B2B 도매</option>
                  <option value="(주)한국보틀">(주)한국보틀</option>
                  <option value="기타/직접입력">기타/직접입력</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">세금계산서 상태</label>
                <select
                  value={adjustTaxStatus}
                  onChange={(e) => setAdjustTaxStatus(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                >
                  <option value="NOT_APPLICABLE">해당없음 / 영세율</option>
                  <option value="UNISSUED">미발행 (추후 전자세금계산서 발행)</option>
                  <option value="ISSUED">발행완료 (승인번호 등록)</option>
                  <option value="EXEMPT">신용카드 / 현금영수증 지출증빙</option>
                </select>
              </div>

              {adjustTaxStatus === "ISSUED" && (
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">국세청 전자세금계산서 승인번호</label>
                  <input
                    type="text"
                    value={adjustTaxNumber}
                    onChange={(e) => setAdjustTaxNumber(e.target.value)}
                    placeholder="예: 20260822-41000001-12345678"
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">상세 사유 *</label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800"
                >
                  {isSubmitting ? "처리 중..." : "반영하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: 📥 BATCH UPLOAD EXCEL / CSV                                      */}
      {/* ========================================================================= */}
      {isBatchUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Excel Batch Sync</span>
                <h3 className="text-lg font-black text-zinc-950">네이버 / 쿠팡 주문 엑셀 일괄 업로드</h3>
              </div>
              <button type="button" onClick={() => setIsBatchUploadModalOpen(false)} className="text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBatchUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">판매 채널 선택</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBatchChannel("NAVER")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      batchChannel === "NAVER" ? "bg-green-600 text-white border-green-600" : "bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    네이버 스마트스토어
                  </button>
                  <button
                    type="button"
                    onClick={() => setBatchChannel("COUPANG")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border ${
                      batchChannel === "COUPANG" ? "bg-rose-600 text-white border-rose-600" : "bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    쿠팡 윙 (Wing)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  엑셀(CSV) 복사 붙여넣기 (스마트스토어/쿠팡 발주서 복사):
                </label>
                <p className="text-[11px] text-zinc-500 mb-2">
                  엑셀 파일 내용 전체(헤더 포함: 주문번호, 상품명, 수량, 주문자명, 배송지 등)를 그대로 복사하여 아래에 붙여넣으세요.
                </p>
                <textarea
                  rows={8}
                  value={batchTextData}
                  onChange={(e) => setBatchTextData(e.target.value)}
                  placeholder={`주문번호\t상품명\t수량\t주문자명\t배송지\n20260822-01\t퍼베이드 올인원 세정제 500ml\t2\t홍길동\t서울시 강남구 테헤란로 123`}
                  className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsBatchUploadModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  {isSubmitting ? "파싱 및 재고 차감 중..." : "일괄 등록 & 재고 자동 차감"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ✍️ NEW MANUAL ORDER MODAL                                         */}
      {/* ========================================================================= */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Manual Order</span>
                <h3 className="text-lg font-black text-zinc-950">수기 주문 등록 (오프라인 / B2B 도매)</h3>
              </div>
              <button type="button" onClick={() => setIsNewOrderModalOpen(false)} className="text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">채널 구분</label>
                <select
                  value={newOrderForm.channel}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, channel: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                >
                  <option value="OFFLINE">오프라인 매장 / 팝업스토어</option>
                  <option value="B2B">B2B 도매 납품</option>
                  <option value="NAVER">네이버 스마트스토어</option>
                  <option value="COUPANG">쿠팡</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">상품 선택</label>
                <select
                  value={newOrderForm.productName}
                  onChange={(e) => {
                    const found = products.find((p) => p.name === e.target.value);
                    setNewOrderForm({
                      ...newOrderForm,
                      productName: e.target.value,
                      unitPrice: found ? found.price : 18900,
                    });
                  }}
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} (재고: {p.stock}개)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">주문 수량 *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newOrderForm.quantity}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">단가 (원)</label>
                  <input
                    type="number"
                    value={newOrderForm.unitPrice}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, unitPrice: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-sm font-bold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">주문자(구매자)명 *</label>
                  <input
                    type="text"
                    required
                    value={newOrderForm.buyerName}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, buyerName: e.target.value })}
                    placeholder="홍길동 또는 (주)도매상호"
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">연락처</label>
                  <input
                    type="text"
                    value={newOrderForm.buyerPhone}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, buyerPhone: e.target.value })}
                    placeholder="010-0000-0000"
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">배송지 주소</label>
                <input
                  type="text"
                  value={newOrderForm.shippingAddress}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, shippingAddress: e.target.value })}
                  placeholder="서울특별시 ... (현장수령 시 빈칸)"
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">택배사</label>
                  <select
                    value={newOrderForm.shippingCarrier}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, shippingCarrier: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="CJ대한통운">CJ대한통운</option>
                    <option value="현장수령/직접배송">현장수령/직접배송</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">CJ 운송장번호</label>
                  <input
                    type="text"
                    value={newOrderForm.trackingNumber}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, trackingNumber: e.target.value })}
                    placeholder="654812390000"
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800"
                >
                  {isSubmitting ? "등록 중..." : "주문 등록 & 재고 차감"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: 🚚 CJ LOGISTICS TRACKING EDIT MODAL                              */}
      {/* ========================================================================= */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">CJ Logistics Tracking</span>
                <h3 className="text-lg font-black text-zinc-950">CJ대한통운 운송장번호 등록/수정</h3>
              </div>
              <button type="button" onClick={() => setEditingOrder(null)} className="text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTracking} className="space-y-4">
              <div>
                <span className="text-xs text-zinc-500 block mb-1">주문자: <strong>{editingOrder.buyerName}</strong></span>
                <span className="text-xs text-zinc-500 block">상품: <strong>{editingOrder.productName}</strong> ({editingOrder.quantity}개)</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">CJ대한통운 운송장번호 *</label>
                <input
                  type="text"
                  required
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  placeholder="예: 654812390123 (숫자만 입력)"
                  className="w-full p-3 bg-zinc-50 border rounded-xl text-sm font-mono font-bold focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800"
                >
                  저장 &amp; 배송중 전환
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: 🧾 TAX INVOICE APPROVAL NUMBER REGISTRATION MODAL                 */}
      {/* ========================================================================= */}
      {editingTaxItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">National Tax Service</span>
                <h3 className="text-lg font-black text-zinc-950">국세청 전자세금계산서 승인번호 등록</h3>
              </div>
              <button type="button" onClick={() => setEditingTaxItem(null)} className="text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTaxNumber} className="space-y-4">
              <p className="text-xs text-zinc-600 leading-relaxed">
                홈택스(Hometax) 또는 연동 전자세금계산서에서 발급된 24자리 승인번호를 입력하시면 [발행완료] 상태로 전환됩니다.
              </p>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">전자세금계산서 승인번호 *</label>
                <input
                  type="text"
                  required
                  value={taxNumberInput}
                  onChange={(e) => setTaxNumberInput(e.target.value)}
                  placeholder="예: 20260822-41000021-99881122"
                  className="w-full p-3 bg-zinc-50 border rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-zinc-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingTaxItem(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  발행완료 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: 🧪 RAW MATERIAL PURCHASE INBOUND MODAL                           */}
      {/* ========================================================================= */}
      {materialInModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-600 uppercase">Material Purchase</span>
                <h3 className="text-lg font-black text-zinc-950">{materialInModal.name} 매입 입고</h3>
              </div>
              <button type="button" onClick={() => setMaterialInModal(null)} className="text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMaterialInSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">입고 수량 ({materialInModal.unit}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={materialInQty}
                    onChange={(e) => setMaterialInQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">매입 총액 (예상)</label>
                  <div className="p-2.5 bg-zinc-100 border rounded-xl text-sm font-extrabold text-amber-800">
                    ₩{(materialInModal.unitCost * materialInQty).toLocaleString()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">매입처명</label>
                <input
                  type="text"
                  value={materialInModal.supplierName || ""}
                  disabled
                  className="w-full p-2.5 bg-zinc-100 border rounded-xl text-xs text-zinc-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">매입 전자세금계산서 승인번호</label>
                <input
                  type="text"
                  value={materialTaxNumber}
                  onChange={(e) => setMaterialTaxNumber(e.target.value)}
                  placeholder="예: 20260822-41000099-12345678"
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setMaterialInModal(null)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
                >
                  입고 등록 &amp; 매입원장 반영
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: 🏢 NEW PARTNER MODAL                                             */}
      {/* ========================================================================= */}
      {isNewPartnerModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Partner Master</span>
                <h3 className="text-lg font-black text-zinc-950">신규 거래처 등록</h3>
              </div>
              <button type="button" onClick={() => setIsNewPartnerModalOpen(false)} className="text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewPartnerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">거래처명 *</label>
                <input
                  type="text"
                  required
                  value={newPartnerForm.name}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, name: e.target.value })}
                  placeholder="예: 쿠팡 윙, (주)한국보틀, 리빙셀렉트 도매"
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">거래처 구분</label>
                  <select
                    value={newPartnerForm.type}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, type: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="SALES">매출처 (판매채널/도매)</option>
                    <option value="PURCHASE">매입처 (원재료/제조)</option>
                    <option value="BOTH">매출/매입 공통</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">채널 유형</label>
                  <select
                    value={newPartnerForm.channelType}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, channelType: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="ONLINE_MALL">온라인 오픈마켓</option>
                    <option value="OFFLINE_STORE">오프라인 매장/팝업</option>
                    <option value="B2B_WHOLESALE">B2B 도매유통</option>
                    <option value="RAW_MATERIAL">원재료/용기 공급사</option>
                    <option value="MANUFACTURER">OEM 제조공장</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">사업자등록번호</label>
                  <input
                    type="text"
                    value={newPartnerForm.bizNumber}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, bizNumber: e.target.value })}
                    placeholder="123-45-67890"
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">대표자명</label>
                  <input
                    type="text"
                    value={newPartnerForm.ceoName}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, ceoName: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">담당자 연락처</label>
                  <input
                    type="text"
                    value={newPartnerForm.contact}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, contact: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">세금계산서 수신 이메일</label>
                  <input
                    type="email"
                    value={newPartnerForm.email}
                    onChange={(e) => setNewPartnerForm({ ...newPartnerForm, email: e.target.value })}
                    placeholder="tax@partner.com"
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">비고 / 정산 주기</label>
                <input
                  type="text"
                  value={newPartnerForm.memo}
                  onChange={(e) => setNewPartnerForm({ ...newPartnerForm, memo: e.target.value })}
                  placeholder="예: 익월 10일 정산, 도매 공급률 60%"
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewPartnerModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 8: 🧪 NEW MATERIAL MODAL                                            */}
      {/* ========================================================================= */}
      {isNewMaterialModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">Raw Material</span>
                <h3 className="text-lg font-black text-zinc-950">신규 원재료/부자재 품목 등록</h3>
              </div>
              <button type="button" onClick={() => setIsNewMaterialModalOpen(false)} className="text-zinc-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleNewMaterialSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">품목명 *</label>
                <input
                  type="text"
                  required
                  value={newMaterialForm.name}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, name: e.target.value })}
                  placeholder="예: 500ml 친환경 PET 용기, 미세안개 스프레이건"
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">분류</label>
                  <select
                    value={newMaterialForm.category}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, category: e.target.value })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  >
                    <option value="CONTAINER">용기 / 공병</option>
                    <option value="SPRAY">스프레이 건 / 캡</option>
                    <option value="RAW_INGREDIENT">원료 / 액상</option>
                    <option value="PACKAGE">패키지 / 박스</option>
                    <option value="LABEL">라벨 / 스티커</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">단위</label>
                  <input
                    type="text"
                    value={newMaterialForm.unit}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, unit: e.target.value })}
                    placeholder="개, kg, L, 박스"
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">초기 재고</label>
                  <input
                    type="number"
                    value={newMaterialForm.currentStock}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">안전재고</label>
                  <input
                    type="number"
                    value={newMaterialForm.safetyStock}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, safetyStock: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">매입 단가 (원)</label>
                  <input
                    type="number"
                    value={newMaterialForm.unitCost}
                    onChange={(e) => setNewMaterialForm({ ...newMaterialForm, unitCost: parseInt(e.target.value) || 0 })}
                    className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">매입처명</label>
                <input
                  type="text"
                  value={newMaterialForm.supplierName}
                  onChange={(e) => setNewMaterialForm({ ...newMaterialForm, supplierName: e.target.value })}
                  placeholder="예: (주)한국보틀"
                  className="w-full p-2.5 bg-zinc-50 border rounded-xl text-xs font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewMaterialModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-zinc-600"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-zinc-950 text-white rounded-xl text-xs font-bold hover:bg-zinc-800"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
