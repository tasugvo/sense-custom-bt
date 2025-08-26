# Custom Export Button - Qlik Sense Extension

![Preview](./preview.png)

## 📌 Sobre o projeto

O **Custom Export Button** é uma extensão para o **Qlik Sense** que
permite criar botões personalizados para exportação de dados e objetos
diretamente das aplicações.\
Este projeto é um **fork** baseado no
[sense-export](https://github.com/stefanwalther/sense-export), criado
por [Stefan Walther](https://github.com/stefanwalther).\
O objetivo deste fork é simplificar a configuração e estilização,
adicionando melhorias visuais e suporte atualizado.

## 🚀 Funcionalidades

-   Criação de botões customizados com ícones e estilos.
-   Exportação de dados diretamente para **Excel/CSV**.
-   Exportação de objetos do Qlik Sense em diferentes formatos.
-   Suporte a **FontAwesome** para ícones.
-   Estilização avançada via **CSS** incluso.
-   Configuração dinâmica via propriedades da extensão.

## 📂 Estrutura do Projeto

    sense-custom-bt-main/
    │── preview.png
    │── template.ng.html          # Template visual do botão
    │── properties.js             # Definições das propriedades configuráveis
    │── custom-export-button.js   # Lógica principal da extensão
    │── custom-export-button.qext # Manifesto da extensão (descrição Qlik)
    │── initialproperties.js      # Propriedades iniciais
    │── lib/                      # Dependências externas e componentes

## 🛠️ Instalação

1.  Baixe este repositório como `.zip`.
2.  Extraia o conteúdo para a pasta de extensões do Qlik Sense:
    -   **Windows:**

            C:\Users\<USUÁRIO>\Documents\Qlik\Sense\Extensions\

    -   **Qlik Sense Server:**\
        Copie a pasta para o diretório de extensões configurado no
        servidor.
3.  Reinicie o Qlik Sense Desktop (ou recarregue no Server).
4.  No editor de aplicação, adicione o objeto **Custom Export Button**.

## ⚙️ Configuração

No painel de propriedades da extensão você pode: - Alterar o **ícone**
do botão. - Escolher a **ação de exportação** (dados, objeto, CSV,
Excel). - Aplicar estilos customizados.

## 📦 Dependências

O projeto utiliza: - [FontAwesome](https://fontawesome.com/) para
ícones. - [FileSaver.js](https://github.com/eligrey/FileSaver.js/) para
exportação de arquivos. - Utilitários da comunidade
**sense-extension-utils**.

## 📝 Licença

Este projeto é distribuído sob a licença MIT.\
Sinta-se livre para usar, modificar e compartilhar.

------------------------------------------------------------------------

🔗 **Fork do projeto
[sense-export](https://github.com/stefanwalther/sense-export), com foco
em melhorias visuais e configuração simplificada.**
