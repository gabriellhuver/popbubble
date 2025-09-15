# 🫧 Pop! Bolhas

Um jogo viciante de estourar bolhas com mecânicas de ritmo e combos. Jogue diretamente no navegador, sem instalação necessária!

## 🎮 Como Jogar

- **Clique ou toque** nas bolhas para estourá-las
- **Bolhas menores** valem mais pontos
- **Combos**: estoure bolhas rapidamente para multiplicar sua pontuação
- **Modo Perfeitos**: ative para jogar no ritmo (120 BPM por padrão)
- **Slow-mo**: atinge combos especiais para desacelerar o tempo

## 🎯 Controles

- **Mouse/Toque**: Estourar bolhas
- **M**: Alternar som
- **P**: Pausar/despausar
- **R**: Reiniciar jogo
- **🎯**: Alternar Modo Perfeitos

## 🚀 Deploy no GitHub Pages

### 1. Configurar o repositório

1. Faça push do código para o GitHub
2. Vá em **Settings** → **Pages**
3. Em **Source**, selecione **Deploy from a branch**
4. Em **Branch**, selecione **main** (ou **master**)
5. Em **Folder**, selecione **/docs**
6. Clique em **Save**

### 2. Acessar o jogo

Após alguns minutos, seu jogo estará disponível em:
```
https://[seu-usuario].github.io/[nome-do-repo]/
```

## 🛠️ Executar Localmente

### Opção 1: Abrir diretamente
```bash
# Navegue até a pasta docs
cd docs

# Abra o index.html no navegador
open index.html  # macOS
start index.html # Windows
```

### Opção 2: Servidor local
```bash
# Instale um servidor HTTP simples
npm install -g http-server

# Execute na pasta docs
cd docs
http-server

# Acesse http://localhost:8080
```

## ⚙️ Parâmetros da URL

- `?dev=1` - Mostra FPS e diagnósticos
- `?bpm=140` - Altera o ritmo base (padrão: 120 BPM)

## 🎵 Recursos

- **Áudio procedural**: Sons gerados dinamicamente via WebAudio
- **Partículas**: Efeitos visuais satisfatórios ao estourar bolhas
- **Responsivo**: Funciona perfeitamente em desktop e mobile
- **Performance**: 60 FPS em dispositivos modernos
- **Acessibilidade**: Feedback visual mesmo com áudio mutado

## 🏆 Sistema de Pontuação

- **Pontuação base**: Inversamente proporcional ao tamanho da bolha
- **Combo**: Multiplica pontuação (máximo 4x)
- **Perfeito**: Bônus de 50% na pontuação
- **Slow-mo**: Ativado nos combos 8, 14, 20, 30

## 📱 Mobile

- Otimizado para touch
- Previne scroll acidental
- Suporte a multi-toque
- Interface adaptativa

## 🔧 Tecnologias

- **HTML5 Canvas** para renderização
- **WebAudio API** para áudio procedural
- **Vanilla JavaScript** (sem dependências)
- **CSS3** para interface responsiva
- **LocalStorage** para recordes

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**Divirta-se estourando bolhas! 🫧✨**
