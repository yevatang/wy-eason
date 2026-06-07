# 文熠生日签抽卡机

一个基于 WebGL + React 的复古抽卡机，为文熠（6月8日生日）专属制作。

## 使用方式

用本地服务器打开（file:// 协议下图片无法加载）：

```bash
python -m http.server 8080
# 然后访问 http://localhost:8080/eason-birthday-card.html
```

## 功能

- 🎰 复古抽卡机 3D 交互
- 🎵 每张卡附带 Eason 歌词情绪签
- 💌 随机抽取亲朋好友祝福语
- 📸 真实照片轮播 + 贴纸装饰
- 🎂 寿星：文熠 · 6月8日

## 技术栈

- React 18（JSX 预编译，无需构建）
- Three.js r128（WebGL 3D 渲染）
- Canvas 2D（卡片纹理绘制）
- 纯静态，无后端，可部署到任何静态托管
