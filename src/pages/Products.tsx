import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Grid,
  List,
  Filter,
  Package,
  Gift,
  Percent,
  Settings,
  Download,
  Upload,
} from "lucide-react";
import Layout from "../components/layout/layout";
import ProductCard from "../components/product/ProductCard";
import ProductModal from "../components/product/ProductModal";
import ComboModal from "../components/product/ComboModal";
import { useProductStore } from "../store/useProductStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import type { Product, ProductCombo, ProductFilters } from "../types/product";
import toast from "react-hot-toast";

type ViewMode = "grid" | "list";
type ActiveTab = "products" | "combos" | "promotions" | "categories";

const Products: React.FC = () => {
  const { currentWorkspace } = useWorkspaceStore();
  const {
    products,
    combos,
    categories,
    isLoading,
    filters,
    fetchProducts,
    fetchCombos,
    fetchCategories,
    deleteProduct,
    deleteCombo,
    toggleProductAvailability,
    setFilters,
    clearFilters,
  } = useProductStore();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [activeTab, setActiveTab] = useState<ActiveTab>("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Modals
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [editingCombo, setEditingCombo] = useState<ProductCombo | undefined>();

  // Load data on mount
  useEffect(() => {
    if (currentWorkspace) {
      loadData();
    }
  }, [currentWorkspace]);

  // Apply filters when search or category changes
  useEffect(() => {
    if (currentWorkspace) {
      const newFilters: ProductFilters = {};

      if (searchTerm) newFilters.search = searchTerm;
      if (selectedCategory) newFilters.category = selectedCategory;

      setFilters(newFilters);
      fetchProducts(currentWorkspace.id, newFilters);
    }
  }, [searchTerm, selectedCategory, currentWorkspace]);

  const loadData = async () => {
    if (!currentWorkspace) return;

    try {
      await Promise.all([
        fetchProducts(currentWorkspace.id),
        fetchCombos(currentWorkspace.id),
        fetchCategories(currentWorkspace.id),
      ]);
    } catch (error) {
      toast.error("Erro ao carregar dados");
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(undefined);
    setProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    // TODO: Implementar modal de visualização de produto
    console.log("View product:", product);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      try {
        await deleteProduct(product.id);
        toast.success("Produto excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir produto");
      }
    }
  };

  const handleToggleProductAvailability = async (product: Product) => {
    try {
      await toggleProductAvailability(product.id);
      toast.success(
        `Produto ${
          product.available ? "desabilitado" : "habilitado"
        } com sucesso!`
      );
    } catch (error) {
      toast.error("Erro ao alterar disponibilidade");
    }
  };

  const handleCreateCombo = () => {
    setEditingCombo(undefined);
    setComboModalOpen(true);
  };

  const handleEditCombo = (combo: ProductCombo) => {
    setEditingCombo(combo);
    setComboModalOpen(true);
  };

  const handleDeleteCombo = async (combo: ProductCombo) => {
    if (window.confirm(`Tem certeza que deseja excluir "${combo.name}"?`)) {
      try {
        await deleteCombo(combo.id);
        toast.success("Combo excluído com sucesso!");
      } catch (error) {
        toast.error("Erro ao excluir combo");
      }
    }
  };

  const filteredProducts = products;
  const availableProducts = products.filter((p) => p.available);
  const unavailableProducts = products.filter((p) => !p.available);

  const tabs = [
    {
      id: "products",
      label: "Produtos",
      icon: Package,
      count: products.length,
    },
    { id: "combos", label: "Combos", icon: Gift, count: combos.length },
    { id: "promotions", label: "Promoções", icon: Percent, count: 0 },
    {
      id: "categories",
      label: "Categorias",
      icon: Settings,
      count: categories.length,
    },
  ];

  const stats = {
    total: products.length,
    available: availableProducts.length,
    unavailable: unavailableProducts.length,
    revenue: products.reduce((sum, p) => sum + p.price, 0),
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestão de Produtos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gerencie produtos, combos e promoções
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <button className="flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Upload className="w-4 h-4" />
              Importar
            </button>

            <button className="flex items-center gap-2 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Exportar
            </button>

            {activeTab === "products" && (
              <button
                onClick={handleCreateProduct}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Novo Produto
              </button>
            )}

            {activeTab === "combos" && (
              <button
                onClick={handleCreateCombo}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Novo Combo
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.available}
                </p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Indisponíveis</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.unavailable}
                </p>
              </div>
              <Package className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Valor Médio</p>
                <p className="text-2xl font-bold text-gray-900">
                  R${" "}
                  {stats.total > 0
                    ? (stats.revenue / stats.total).toFixed(2)
                    : "0,00"}
                </p>
              </div>
              <Percent className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                    {tab.count > 0 && (
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          isActive
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Filters and Controls */}
          <div className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {activeTab === "products" && (
                <>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Filter className="w-5 h-5" />
                    Filtros
                  </button>

                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${
                        viewMode === "grid" ? "bg-gray-100" : ""
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${
                        viewMode === "list" ? "bg-gray-100" : ""
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && activeTab === "products" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço mínimo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="0,00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço máximo
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="100,00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Disponibilidade
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                      <option value="">Todos</option>
                      <option value="true">Disponível</option>
                      <option value="false">Indisponível</option>
                    </select>
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Limpar
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {activeTab === "products" && (
              <div>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={handleEditProduct}
                        onDelete={handleDeleteProduct}
                        onToggleAvailability={handleToggleProductAvailability}
                        onView={handleViewProduct}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Produto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preço
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map((product) => {
                          const category = categories.find(
                            (c) => c.id === product.category
                          );
                          return (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {product.image ? (
                                      <img
                                        className="h-10 w-10 rounded-lg object-cover"
                                        src={product.image}
                                        alt={product.name}
                                      />
                                    ) : (
                                      <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <Package className="w-5 h-5 text-gray-400" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {product.name}
                                    </div>
                                    {product.description && (
                                      <div className="text-sm text-gray-500 truncate max-w-xs">
                                        {product.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {category?.name || "Sem categoria"}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  R${" "}
                                  {product.price.toLocaleString("pt-BR", {
                                    minimumFractionDigits: 2,
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    product.available
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {product.available
                                    ? "Disponível"
                                    : "Indisponível"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleToggleProductAvailability(product)
                                    }
                                    className={`${
                                      product.available
                                        ? "text-orange-600 hover:text-orange-900"
                                        : "text-green-600 hover:text-green-900"
                                    }`}
                                  >
                                    {product.available
                                      ? "Desabilitar"
                                      : "Habilitar"}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum produto encontrado
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || selectedCategory
                        ? "Tente ajustar os filtros ou buscar por outros termos"
                        : "Comece criando seu primeiro produto"}
                    </p>
                    {!searchTerm && !selectedCategory && (
                      <button
                        onClick={handleCreateProduct}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        Criar Primeiro Produto
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "combos" && (
              <div>
                {combos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {combos.map((combo) => (
                      <div
                        key={combo.id}
                        className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {combo.name}
                              </h3>
                              {combo.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {combo.description}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                combo.available
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {combo.available ? "Disponível" : "Indisponível"}
                            </span>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                Preço original:
                              </span>
                              <span className="line-through text-gray-500">
                                R${" "}
                                {combo.originalPrice.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-lg font-bold text-gray-900">
                                Preço do combo:
                              </span>
                              <span className="text-lg font-bold text-green-600">
                                R${" "}
                                {combo.price.toLocaleString("pt-BR", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Desconto:</span>
                              <span className="font-medium text-green-600">
                                -{combo.discount}%
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                              {combo.items.length} produtos no combo
                            </p>
                            <div className="space-y-1">
                              {combo.items.slice(0, 3).map((item) => (
                                <div
                                  key={item.productId}
                                  className="flex items-center justify-between text-xs text-gray-600"
                                >
                                  <span>
                                    {item.quantity}x {item.product.name}
                                  </span>
                                  <span>
                                    R${" "}
                                    {(
                                      item.product.price * item.quantity
                                    ).toLocaleString("pt-BR", {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              ))}
                              {combo.items.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +{combo.items.length - 3} outros produtos
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditCombo(combo)}
                              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDeleteCombo(combo)}
                              className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              Excluir
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Gift className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum combo criado
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Crie combos para oferecer produtos em conjunto com
                      desconto
                    </p>
                    <button
                      onClick={handleCreateCombo}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Criar Primeiro Combo
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "promotions" && (
              <div className="text-center py-12">
                <Percent className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Promoções em desenvolvimento
                </h3>
                <p className="text-gray-500">
                  Esta funcionalidade estará disponível em breve
                </p>
              </div>
            )}

            {activeTab === "categories" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">
                            {category.icon || "📁"}
                          </span>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {category.name}
                          </h3>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {category.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {
                            products.filter((p) => p.category === category.id)
                              .length
                          }{" "}
                          produtos
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          category.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {category.active ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Settings className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma categoria criada
                    </h3>
                    <p className="text-gray-500">
                      Crie categorias para organizar seus produtos
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setEditingProduct(undefined);
        }}
        product={editingProduct}
        workspaceId={currentWorkspace?.id || ""}
      />

      <ComboModal
        isOpen={comboModalOpen}
        onClose={() => {
          setComboModalOpen(false);
          setEditingCombo(undefined);
        }}
        combo={editingCombo}
        workspaceId={currentWorkspace?.id || ""}
      />
    </Layout>
  );
};

export default Products;
