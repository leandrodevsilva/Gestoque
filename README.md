# 🏺 Gestoque - Gestão de Estoque e Orçamento

Um sistema completo e moderno para gerenciamento de estoque e orçamento, desenvolvido com React, TypeScript e Tailwind CSS.

![Gestoque](https://images.pexels.com/photos/6347707/pexels-photo-6347707.jpeg?auto=compress&cs=tinysrgb&w=1200&h=400&fit=crop)

## ✨ Características Principais

### 🎯 **Funcionalidades Completas**
- **Dashboard Interativo** - Visão geral com gráficos e estatísticas
- **Gestão de Produtos** - Cadastro, edição e controle de produtos
- **Sistema de Vendas** - Registro, edição e exclusão de vendas
- **Controle de Despesas** - Categorização e acompanhamento de gastos
- **Monitoramento de Estoque** - Alertas de estoque baixo e relatórios
- **Histórico Financeiro** - Análise mensal de receitas e despesas
- **Sistema de Backup** - Backup automático e manual com restauração

### 🎨 **Design e Experiência**
- **Interface Moderna** - Design limpo e profissional
- **Modo Escuro/Claro** - Alternância automática entre temas
- **Responsivo** - Funciona perfeitamente em desktop, tablet e mobile
- **Animações Suaves** - Micro-interações e transições elegantes
- **Acessibilidade** - Interface intuitiva e fácil de usar

### 🔧 **Tecnologias Utilizadas**
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização moderna
- **Lucide React** - Ícones elegantes
- **Chart.js** - Gráficos interativos
- **Vite** - Build tool rápido

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Passos de Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/leandrodevsilva/gestoque.git
cd estoque
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npm run dev
```

4. **Acesse o sistema**
```
http://localhost:5173
```

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── Backup/          # Sistema de backup
│   ├── Dashboard/       # Painel principal
│   ├── Despesas/        # Gestão de despesas
│   ├── Estoque/         # Controle de estoque
│   ├── Historico/       # Histórico financeiro
│   ├── Layout/          # Componentes de layout
│   ├── Produtos/        # Gestão de produtos
│   └── Vendas/          # Sistema de vendas
├── contexts/            # Contextos React
├── hooks/               # Hooks personalizados
├── types/               # Definições TypeScript
├── utils/               # Funções utilitárias
└── index.css           # Estilos globais
```

## 🎯 Funcionalidades Detalhadas

### 📊 **Dashboard**
- Visão geral do negócio
- Gráficos de receitas por produto
- Gráficos de despesas por categoria
- Cards com estatísticas principais
- Navegação rápida para outras seções

### 📦 **Gestão de Produtos**
- Cadastro de novos produtos
- Edição inline de informações
- Adição de estoque a produtos existentes
- Histórico completo de movimentações
- Alertas de estoque baixo

### 💰 **Sistema de Vendas**
- Registro de vendas com validação de estoque
- Edição completa de vendas existentes
- Exclusão com reversão automática de estoque
- Cálculo automático de valores
- Histórico detalhado de transações

### 💸 **Controle de Despesas**
- Criação de categorias personalizadas
- Registro de despesas por categoria
- Edição e exclusão de tipos de despesa
- Relatórios por período
- Análise de gastos

### 📈 **Relatórios e Histórico**
- Análise financeira mensal
- Comparação de receitas vs despesas
- Detalhamento por período
- Gráficos interativos
- Exportação de dados

### 💾 **Sistema de Backup**
- Backup automático configurável
- Backup manual sob demanda
- Backups de emergência locais
- Restauração completa de dados
- Exportação seletiva por módulo

## 🛡️ Segurança e Dados

### **Armazenamento Local**
- Todos os dados são salvos no localStorage do navegador
- Não há transmissão de dados para servidores externos
- Backup automático para prevenir perda de dados
- Validações rigorosas em todas as operações

### **Integridade dos Dados**
- Validação de entrada em todos os formulários
- Confirmações para operações críticas
- Reversão automática em caso de erro
- Histórico completo de alterações

## 🎨 Personalização

### **Temas**
O sistema suporta modo claro e escuro com alternância automática baseada na preferência do sistema ou manual pelo usuário.

### **Cores Personalizadas**
As cores podem ser facilmente modificadas no arquivo `tailwind.config.js`:

```javascript
colors: {
  primary: { /* Cor principal */ },
  success: { /* Cor de sucesso */ },
  danger: { /* Cor de perigo */ },
  // ... outras cores
}
```

## 📱 Responsividade

O sistema é totalmente responsivo e funciona perfeitamente em:
- **Desktop** - Experiência completa
- **Tablet** - Layout adaptado
- **Mobile** - Interface otimizada para toque

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Gera build de produção
npm run preview      # Visualiza build de produção
npm run lint         # Executa linting do código
```

## 📋 Requisitos do Sistema

### **Navegadores Suportados**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### **Recursos Necessários**
- JavaScript habilitado
- LocalStorage disponível
- Resolução mínima: 320px

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Consulte o [Manual do Usuário](MANUAL_USUARIO.md)
- Entre em contato: lasmg93@outlook.com

**Desenvolvido para pequenos negócios de produtos**
