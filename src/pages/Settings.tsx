import React from "react";

import { Bell, Printer, Globe, Shield, CreditCard, Users } from "lucide-react";
import Layout from "../components/layout/layout";

const Settings: React.FC = () => {
  const settingsSections = [
    {
      title: "Notificações",
      icon: Bell,
      description: "Configure alertas e sons de notificação",
    },
    {
      title: "Impressão",
      icon: Printer,
      description: "Configure impressoras e modelos de recibo",
    },
    {
      title: "Integrações",
      icon: Globe,
      description: "Configure integrações com delivery e pagamento",
    },
    {
      title: "Segurança",
      icon: Shield,
      description: "Gerencie senhas e autenticação",
    },
    {
      title: "Pagamentos",
      icon: CreditCard,
      description: "Configure formas de pagamento",
    },
    {
      title: "Equipe",
      icon: Users,
      description: "Gerencie usuários e permissões",
    },
  ];

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie as configurações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.title}
                className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {section.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
