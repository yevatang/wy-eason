        const { useState, useEffect, useRef } = React;

        const DRAW_CARD_CONFIG = window.DRAW_CARD_GIFT_CONFIG || {};
        const WISH_COPY = {
            panelTitle: '生日签已就绪',
            panelSubtitle: 'BIRTHDAY FORTUNE CARD',
            lyricLabel: '今日适合听',
            lyricPlaceholder: '',
            colorLabel: '主题色',
            memoLabel: '备忘',
            memoPlaceholder: '',
            styleLabel: '风格',
            cardStyleLabel: '卡片风格',
            cancelLabel: '关闭',
            submitLabel: '抽一张生日签',
            insertTitle: 'BIRTHDAY CARD',
            defaultLyric: '单车',
            knobHint: '旋转右侧旋钮',
            knobHintSub: '拖动它吐出生日签',
            closeLabel: '关闭',
            resultAlt: '生日签',
            saveLabel: '保存生日签',
            delivered: '生日签已滑进卡槽，去转右侧旋钮',
            machineButton: '抽一张生日签',
            downloadPrefix: 'eason-birthday-card',
            fallbackCardTitle: 'EASON BIRTHDAY CARD',
            fallbackPhotoText: 'Birthday Fortune',
            ...(DRAW_CARD_CONFIG.copy || {})
        };

        const CAROUSEL_PHOTOS = DRAW_CARD_CONFIG.carouselPhotos || [];

        const DEFAULT_LYRIC_LINES = `
生日快乐
许个愿望吧
今天是你的日子
蜡烛在等你吹
笑一个
幸福在路上了
今天值得庆祝
愿望会实现的
快乐最重要
做最快乐的自己
生日限定好运
你是今天的 star
        `.trim().split('\n').map(line => line.trim()).filter(Boolean);
        const LYRIC_LINES = DRAW_CARD_CONFIG.lyrics || DEFAULT_LYRIC_LINES;

        const WISH_PHOTOS = DRAW_CARD_CONFIG.wishPhotos || [];

        const WISH_STICKERS = DRAW_CARD_CONFIG.wishStickers || [];

        const DECOR_STICKERS = DRAW_CARD_CONFIG.decorStickers || [];

        const DECOR_STICKER_GROUPS = DRAW_CARD_CONFIG.decorStickerGroups || {
            travel: [],
            sweet: [],
            stage: [],
            soft: [],
            playful: []
        };

        const WISH_STYLE_CANDIDATES = DRAW_CARD_CONFIG.wishStyleCandidates || {
            '巨帅！': [0, 6, 7],
            '温柔暴击': [1, 4, 6],
            '搞笑得没边': [3, 5, 8, 9],
            '深情！迷死我吧': [0, 2, 7]
        };

        // ====== 生日签数据 ======
        const BIRTHDAY_CARDS = [
            { song: '单车', emotion: '适合独处充电的一天，允许自己慢下来', note: '今天是你骑上风的年纪，生日快乐' },
            { song: 'K歌之王', emotion: '把心事唱出来吧，麦克风前没有秘密', note: '愿你的每一天都有属于自己的BGM' },
            { song: '稳稳的幸福', emotion: '今天稳稳的就是最好的节奏', note: '平平淡淡是最大的幸运，生日快乐' },
            { song: '浮夸', emotion: '适当浮夸一下也无妨，你值得被看见', note: '别收起你的光芒，今天你是绝对的主角' },
            { song: '最佳损友', emotion: '给老朋友发条消息吧，他们也在想你', note: '真正的朋友不需要太多，有就够好了' },
            { song: '孤独患者', emotion: '孤独不是病，是和自己约会的时光', note: '享受一个人的时光，也是一种浪漫' },
            { song: '一丝不挂', emotion: '放下伪装的今天，做个真实的自己', note: '最自在的样子，就是最好的样子' },
            { song: '十年', emotion: '时间会给你答案，不急', note: '十年之后的今天，希望你依然在笑' },
            { song: '沙龙', emotion: '快门按下那一刻，世界暂停了', note: '人生的每一帧都值得被记住' },
            { song: '陀飞轮', emotion: '时间从不等人，但今天你可以等一等', note: '时间可以买很多东西，但买不到这一刻' },
            { song: '落花流水', emotion: '顺其自然吧，有些事慢慢就对了', note: '随缘是最强的人生态度' },
            { song: '岁月如歌', emotion: '今天是属于你的纪念日', note: '愿你岁岁有今朝，年年有今日' }
        ];

        const HIDDEN_CARD = {
            song: '明年今日',
            emotion: '你发现了隐藏签！今天是天选之日',
            note: '命运藏了一张牌给你，第七张才露面——这是生日最特别的彩蛋'
        };

        const FINAL_CARD = {
            song: '你的那一首',
            emotion: '所有歌都是为你而唱的，最后这张也是',
            note: '生日快乐。感谢你抽到这里，你值得这世上最好的一切'
        };

        const getDrawCount = () => {
            try { return parseInt(localStorage.getItem('eason-birthday-draw-count') || '0', 10); }
            catch(e) { return 0; }
        };

        const setDrawCount = (count) => {
            try { localStorage.setItem('eason-birthday-draw-count', String(count)); }
            catch(e) {}
        };

        const getDrawnIndices = () => {
            try { return JSON.parse(localStorage.getItem('eason-birthday-drawn') || '[]'); }
            catch(e) { return []; }
        };

        const setDrawnIndices = (indices) => {
            try { localStorage.setItem('eason-birthday-drawn', JSON.stringify(indices)); }
            catch(e) {}
        };

        const pickBirthdayCard = () => {
            const count = getDrawCount();
            const newCount = count + 1;
            setDrawCount(newCount);

            if (newCount === 7) {
                return { ...HIDDEN_CARD, isSpecial: true, drawNumber: newCount };
            }
            if (newCount === 12) {
                return { ...FINAL_CARD, isSpecial: true, isFinal: true, drawNumber: newCount };
            }

            const drawn = getDrawnIndices();
            let available = [];
            for (let i = 0; i < BIRTHDAY_CARDS.length; i++) {
                if (!drawn.includes(i)) available.push(i);
            }
            if (available.length === 0) {
                available = BIRTHDAY_CARDS.map((_, i) => i);
            }
            const pick = available[Math.floor(Math.random() * available.length)];
            drawn.push(pick);
            setDrawnIndices(drawn);
            return { ...BIRTHDAY_CARDS[pick], isSpecial: false, drawNumber: newCount };
        };

        const WISH_CARD_TEMPLATES = DRAW_CARD_CONFIG.cardTemplates || [
            {
                id: 'aftershow-letter',
                name: '散场后的来信',
                layout: 'letter',
                photoIndex: 1,
                match: {
                    cardStyle: '文艺信笺',
                    easonStyle: '温柔暴击',
                    memoIncludes: ['演唱会', '港风', '想逗 TA 笑', '春天', '旅行', '希望'],
                    lyricIncludes: ['今天只做一件事', '情人游天地', '幸福感觉却不朽', '晚霞']
                },
                fallbackLyric: '今天只做一件事',
                label: 'after the encore',
                corner: '05.19 / 收件',
                kicker: '散场后的灯仍在',
                footer: 'sealed for later',
                memoFallback: ['潮湿海港', '余温还亮着'],
                poemFragments: ['把温柔夹进信纸', '下一次合唱仍在路上'],
                decorSources: [
                    'stickers/decorations/sticker_102.png',
                    'stickers/decorations/sticker_43.png'
                ],
                decorPlacements: [
                    { x: 376, y: 602, size: 66, angle: -0.24, alpha: 0.42 },
                    { x: 456, y: 574, size: 46, angle: 0.16, alpha: 0.5 }
                ],
                paperTags: [
                    { text: 'held light', x: 70, y: 456, width: 100, angle: -0.28 },
                    { text: 'soft return', x: 408, y: 448, width: 118, angle: 0.09 }
                ],
                stampText: 'POST'
            },
            {
                id: 'blue-echo',
                name: '蓝色回声',
                layout: 'echo',
                photoIndex: 2,
                match: {
                    cardStyle: '像素电波',
                    easonStyle: '深情！迷死我吧',
                    memoIncludes: ['蓝', '夜', '月', '天空'],
                    lyricIncludes: ['会不会', '怀念', '天空']
                },
                fallbackLyric: '你会不会忽然的出现',
                label: 'quiet blue room',
                corner: '夜航 / 回声',
                kicker: '把月光借给旧梦',
                footer: 'keep the echo',
                memoFallback: ['蓝色房间', '慢慢回声'],
                poemFragments: ['讯号穿过蓝夜', '回声在暗处发亮'],
                decorSources: [
                    'stickers/decorations/sticker_149.png',
                    'stickers/decorations/sticker_87.png'
                ],
                decorPlacements: [
                    { x: 370, y: 608, size: 84, angle: -0.08, alpha: 0.58 },
                    { x: 456, y: 572, size: 64, angle: 0.16, alpha: 0.5 }
                ],
                paperTags: [
                    { text: 'low signal', x: 76, y: 454, width: 108, angle: -0.14 },
                    { text: 'blue return', x: 408, y: 450, width: 116, angle: 0.07 }
                ],
                stampText: 'ECHO'
            },
            {
                id: 'playful-ticket',
                name: '轻喜剧票根',
                layout: 'ticket',
                photoIndex: 3,
                match: {
                    cardStyle: '电影票根',
                    easonStyle: '搞笑得没边',
                    memoIncludes: ['电影', '票', '笑', '快乐', '搞笑'],
                    lyricIncludes: ['快乐', '欢乐', '梦']
                },
                fallbackLyric: '特别鸣谢你制造更欢乐的我',
                label: 'tiny cinema',
                corner: '笑声 / 入场',
                kicker: '轻喜剧正在检票',
                footer: 'admit one wish',
                memoFallback: ['微小剧场', '笑声落座'],
                poemFragments: ['票根里藏着一点风', '快乐有自己的座位'],
                decorSources: [
                    'stickers/decorations/ID #2368E Scene Clap Board Movie Magic Hallmark Iron On Badges Appliques Patches, http___www_amazon.com_dp_B00GA8ZO1Q_ref=cm_sw_r_pi_awdm_n.png',
                    'stickers/decorations/sticker_8.png'
                ],
                decorPlacements: [
                    { x: 458, y: 574, size: 54, angle: -0.08, alpha: 0.62 },
                    { x: 374, y: 612, size: 82, angle: 0.09, alpha: 0.46 }
                ],
                paperTags: [
                    { text: 'admit joy', x: 70, y: 456, width: 100, angle: -0.28 },
                    { text: 'scene two', x: 410, y: 448, width: 108, angle: 0.1 }
                ],
                stampText: 'TICKET'
            },
            {
                id: 'sweet-sparkle',
                name: '闪片小汽水',
                layout: 'sparkle',
                photoIndex: 4,
                match: {
                    cardStyle: '可爱闪片',
                    easonStyle: '巨帅！',
                    memoIncludes: ['可爱', '生日', '甜', '汽水', '闪', '快乐', '帅'],
                    lyricIncludes: ['快乐', '庆祝', '假期', '伴着你我']
                },
                fallbackLyric: '常为琐事而庆祝',
                label: 'pocket glitter',
                corner: 'LUCKY / 05.19',
                kicker: '小小闪光正在靠近',
                footer: 'tiny luck',
                memoFallback: ['汽水泡泡', '闪片落进口袋'],
                poemFragments: ['把快乐别在衣角', '今天也可以发亮'],
                decorSources: [
                    'stickers/decorations/Strawberry Soda.png',
                    'stickers/decorations/✢Ramune PNG pic✢.png'
                ],
                decorPlacements: [
                    { x: 376, y: 596, size: 66, angle: -0.18, alpha: 0.58 },
                    { x: 462, y: 570, size: 62, angle: 0.12, alpha: 0.5 }
                ],
                paperTags: [
                    { text: 'tiny luck', x: 78, y: 456, width: 102, angle: -0.18 },
                    { text: 'soft pop', x: 410, y: 450, width: 104, angle: 0.12 }
                ],
                stampText: 'LUCK'
            }
        ];

        const MEMO_POETIC_MAP = [
            { keys: ['演唱会', '舞台', '唱', 'concert', 'show'], text: '散场后的灯' },
            { keys: ['港风', '香港', '海', '潮'], text: '潮湿海港' },
            { keys: ['生日', '蜡烛'], text: '借一枚蜡烛' },
            { keys: ['想逗 TA 笑', '逗', '笑', '快乐'], text: '笑声别在衣角' },
            { keys: ['春天', '春', 'green'], text: '绿意经过窗边' },
            { keys: ['旅行', '行李', '远方', '假期'], text: '把远方放进口袋' },
            { keys: ['希望', 'hope'], text: '仍有一点光' },
            { keys: ['蓝', '夜', '月'], text: '蓝色夜航' },
            { keys: ['电影', '票根', '入场', '座位'], text: '这一幕暂不散场' },
            { keys: ['可爱', '甜', '汽水', '闪片'], text: '闪光落在杯沿' },
            { keys: ['帅', '巨帅', '光', '银幕'], text: '锋利光线落在肩上' }
        ];

        const LYRIC_POETIC_MAP = [
            { keys: ['今天只做一件事'], text: '只给今天留一盏灯' },
            { keys: ['情人游天地', '日月换行李'], text: '把日月装进行李' },
            { keys: ['幸福感觉却不朽'], text: '把不朽藏进余温' },
            { keys: ['你会不会忽然的出现'], text: '重逢在蓝色路口' },
            { keys: ['快乐', '欢乐', '庆祝'], text: '笑声有自己的座位' },
            { keys: ['天空', '飞'], text: '把天空借给迟到的人' },
            { keys: ['晚霞'], text: '晚霞替你签收' },
            { keys: ['怀念', '美妙'], text: '怀念被轻轻按下暂停' }
        ];

        const EASON_STYLE_POETIC_MAP = {
            '巨帅！': ['舞台把影子拉长', '风从领口掠过'],
            '温柔暴击': ['把话说轻一点', '温柔慢慢抵达'],
            '搞笑得没边': ['笑声先一步入场', '快乐在角落眨眼'],
            '深情！迷死我吧': ['旧梦仍在回声里', '夜色替你保密']
        };

        const CARD_STYLE_POETIC_MAP = {
            '可爱闪片': ['小小幸运发亮', '闪片落进今天'],
            '文艺信笺': ['把心事折成页脚', '邮戳轻轻盖下'],
            '电影票根': ['票根留住掌声', '这一幕暂不散场'],
            '像素电波': ['讯号穿过蓝夜', '回声贴近耳边']
        };

        const hashWishText = (text = '') => {
            let hash = 2166136261;
            for (let index = 0; index < text.length; index++) {
                hash ^= text.charCodeAt(index);
                hash = Math.imul(hash, 16777619);
            }
            return Math.abs(hash >>> 0);
        };

        const normalizeWishText = (text = '') => String(text || '').toLowerCase();

        const resolveWishCardTemplate = (form = {}) => {
            const source = normalizeWishText(`${form.lyric || ''} ${form.memo || ''}`);
            const selectedByCardStyle = WISH_CARD_TEMPLATES.find(template => form.cardStyle === template.match.cardStyle);
            if (selectedByCardStyle) return selectedByCardStyle;

            let best = WISH_CARD_TEMPLATES[0];
            let bestScore = -1;

            WISH_CARD_TEMPLATES.forEach((template) => {
                let score = 0;
                if (form.cardStyle === template.match.cardStyle) score += 8;
                if (form.easonStyle === template.match.easonStyle) score += 7;
                if ((template.match.memoIncludes || []).some(key => source.includes(normalizeWishText(key)))) score += 4;
                if ((template.match.lyricIncludes || []).some(key => source.includes(normalizeWishText(key)))) score += 4;
                if (score > bestScore) {
                    best = template;
                    bestScore = score;
                }
            });

            return best;
        };

        const resolvePoeticMemoLines = (form = {}, template = WISH_CARD_TEMPLATES[0]) => {
            const memoSource = normalizeWishText(form.memo || '');
            const lyricSource = normalizeWishText(form.lyric || '');
            const memoLines = MEMO_POETIC_MAP
                .filter(item => item.keys.some(key => memoSource.includes(normalizeWishText(key))))
                .map(item => item.text);
            const lyricLines = LYRIC_POETIC_MAP
                .filter(item => item.keys.some(key => lyricSource.includes(normalizeWishText(key))))
                .map(item => item.text);
            const styleLines = EASON_STYLE_POETIC_MAP[form.easonStyle] || [];
            const cardStyleLines = CARD_STYLE_POETIC_MAP[form.cardStyle] || [];
            const userMemoLine = form.memo && !memoLines.length
                ? `把「${String(form.memo).slice(0, 8)}」留在页边`
                : '';
            const lines = [
                ...memoLines,
                ...lyricLines,
                userMemoLine,
                ...styleLines,
                ...cardStyleLines,
                ...(template.memoFallback || []),
                ...(template.poemFragments || [])
            ].filter(Boolean);

            return [...new Set(lines)].slice(0, 4);
        };

        const pickWishCardIndex = (form) => {
            const template = resolveWishCardTemplate(form);
            if (typeof template.photoIndex === 'number') return template.photoIndex;
            const candidates = WISH_STYLE_CANDIDATES[form.easonStyle] || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
            const seed = hashWishText(`${form.lyric}|${form.memo}|${form.themeColor}|${form.easonStyle}|${form.cardStyle}`);
            return candidates[seed % candidates.length];
        };

        const pickDecorStickerSources = (form = {}, seed = 0) => {
            const sourceText = `${form.lyric || ''} ${form.memo || ''} ${form.easonStyle || ''} ${form.cardStyle || ''}`.toLowerCase();
            const groups = [];
            if (/飞|天空|假期|旅行|远方|行李|air|sky|travel|trip/.test(sourceText)) groups.push('travel');
            if (/甜|生日|笑|快乐|可爱|汽水|春|spring|sweet|cute|happy/.test(sourceText)) groups.push('sweet');
            if (/演唱会|港风|电影|票|舞台|音乐|唱|show|movie|stage|concert/.test(sourceText)) groups.push('stage');
            if (/温柔|深情|晚霞|怀念|浪漫|月|hope|soft|love/.test(sourceText)) groups.push('soft');
            if (/搞笑|没边|玩|怪|逗|fun|play/.test(sourceText)) groups.push('playful');

            if (!groups.length) {
                groups.push(form.easonStyle === '搞笑得没边' ? 'playful' : form.easonStyle === '巨帅！' ? 'stage' : 'soft');
            }

            const pool = groups.flatMap(group => DECOR_STICKER_GROUPS[group] || []);
            const fallback = DECOR_STICKERS.filter(src => !src.includes('.DS_Store'));
            const uniquePool = [...new Set([...pool, ...fallback])];
            const start = seed % uniquePool.length;
            return [0, 1, 2].map(offset => uniquePool[(start + offset * 3) % uniquePool.length]);
        };

        const hexToRgb = (hex) => {
            const normalized = String(hex || '#7fded8').replace('#', '');
            const value = normalized.length === 3
                ? normalized.split('').map(ch => ch + ch).join('')
                : normalized.padEnd(6, '0').slice(0, 6);
            return {
                r: parseInt(value.slice(0, 2), 16),
                g: parseInt(value.slice(2, 4), 16),
                b: parseInt(value.slice(4, 6), 16)
            };
        };

        const rgbToCss = ({ r, g, b }, alpha = 1) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

        const blendRgb = (from, to, amount) => ({
            r: Math.round(from.r + (to.r - from.r) * amount),
            g: Math.round(from.g + (to.g - from.g) * amount),
            b: Math.round(from.b + (to.b - from.b) * amount)
        });

        const splitCardText = (ctx, text, maxWidth, maxLines) => {
            const source = String(text || '').trim();
            if (!source) return [];
            const chars = Array.from(source);
            const lines = [];
            let current = '';
            chars.forEach((char) => {
                const next = current + char;
                if (ctx.measureText(next).width > maxWidth && current) {
                    lines.push(current);
                    current = char;
                } else {
                    current = next;
                }
            });
            if (current) lines.push(current);
            if (lines.length > maxLines) {
                lines.length = maxLines;
                lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, Math.max(0, lines[maxLines - 1].length - 1))}…`;
            }
            return lines;
        };

        const createCardDownloadUrl = (imageDataUrl) => {
            if (!imageDataUrl || !imageDataUrl.startsWith('data:')) return imageDataUrl || '#';

            try {
                const commaIndex = imageDataUrl.indexOf(',');
                const meta = imageDataUrl.slice(0, commaIndex);
                const data = imageDataUrl.slice(commaIndex + 1);
                const mimeMatch = meta.match(/data:([^;]+)/);
                const mime = mimeMatch ? mimeMatch[1] : 'image/png';
                const binary = meta.includes(';base64') ? atob(data) : decodeURIComponent(data);
                const bytes = new Uint8Array(binary.length);

                for (let index = 0; index < binary.length; index++) {
                    bytes[index] = binary.charCodeAt(index);
                }

                return URL.createObjectURL(new Blob([bytes], { type: mime }));
            } catch (error) {
                return imageDataUrl;
            }
        };

        const revokeCardDownloadUrl = (url) => {
            if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        };

        class GachaMachine3D {
            constructor(container, options = {}) {
                this.container = container;
                this.onWishButtonClick = options.onWishButtonClick || (() => {});
                this.onWishCardExpanded = options.onWishCardExpanded || (() => {});
                this.onKnobAwaitingChange = options.onKnobAwaitingChange || (() => {});
                this.scene = new THREE.Scene();

                this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
                this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

                this.renderer.setSize(window.innerWidth, window.innerHeight);
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                this.renderer.physicallyCorrectLights = true;
                this.renderer.outputEncoding = THREE.sRGBEncoding;
                this.container.appendChild(this.renderer.domElement);

                // --- Setup Controls for 360 Rotation ---
                this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
                this.controls.enableDamping = true;
                this.controls.dampingFactor = 0.05;
                this.controls.enableZoom = true;
                this.controls.enablePan = false;

                const macColor = 0xe8e8d8;
                const darkMacColor = 0xc0c0b0;

                this.matBody = new THREE.MeshStandardMaterial({
                    color: macColor,
                    roughness: 0.6,
                    metalness: 0.1,
                });

                this.matDark = new THREE.MeshStandardMaterial({
                    color: 0x333333,
                    roughness: 0.9,
                    metalness: 0.2
                });

                this.matKnob = new THREE.MeshStandardMaterial({
                    color: darkMacColor,
                    roughness: 0.5,
                    metalness: 0.2
                });

                this.matBlueHardware = new THREE.MeshStandardMaterial({
                    color: 0x57aecb,
                    roughness: 0.38,
                    metalness: 0.28,
                    emissive: 0x1b6f89,
                    emissiveIntensity: 0.16
                });

                this.matBlueDark = new THREE.MeshStandardMaterial({
                    color: 0x174861,
                    roughness: 0.42,
                    metalness: 0.5,
                    emissive: 0x17899d,
                    emissiveIntensity: 0.22
                });

                this.matScreen = new THREE.MeshPhysicalMaterial({
                    color: 0x1a1a1a,
                    metalness: 0.9,
                    roughness: 0.1,
                    envMapIntensity: 1.0,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.1
                });

                this.matCard = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    roughness: 0.5,
                    metalness: 0.0,
                    side: THREE.DoubleSide
                });

                this.machineGroup = new THREE.Group();
                this.machineGroup.scale.set(0.82, 0.82, 0.82);
                this.machineGroup.position.y = -0.12;
                this.scene.add(this.machineGroup);
                window.__gachaMachine = this;

                this.createEnvironmentMap();

                this.buildMachine();
                this.setupLighting();

                this.camera.position.set(6, 4, 8);
                this.controls.target.set(0, 0, 0);
                this.controls.update();

                this.isAnimating = false;
                this.awaitingWishKnob = false;
                this.pendingWishForm = null;
                this.pendingWishRequestId = 0;
                this.isKnobDragging = false;
                this.knobDragTotal = 0;
                this.raycaster = new THREE.Raycaster();
                this.mouse = new THREE.Vector2();

                this.handleResize = this.handleResize.bind(this);
                this.handlePointerDown = this.handlePointerDown.bind(this);
                this.handlePointerMove = this.handlePointerMove.bind(this);
                this.handlePointerUp = this.handlePointerUp.bind(this);
                this.animateLoop = this.animateLoop.bind(this);

                this.bindEvents();

                this.animationId = requestAnimationFrame(this.animateLoop);
            }

            createEnvironmentMap() {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const context = canvas.getContext('2d');

                const gradient = context.createLinearGradient(0, 0, 0, 512);
                gradient.addColorStop(0, '#ffffff');
                gradient.addColorStop(0.5, '#aaaaaa');
                gradient.addColorStop(1, '#222222');

                context.fillStyle = gradient;
                context.fillRect(0, 0, 512, 512);

                const envTexture = new THREE.CanvasTexture(canvas);
                envTexture.mapping = THREE.EquirectangularReflectionMapping;
                envTexture.encoding = THREE.sRGBEncoding;

                this.scene.environment = envTexture;
                this.matScreen.envMap = envTexture;
            }

            createRoundedRectShape(width, height, radius) {
                const shape = new THREE.Shape();
                const x = -width / 2;
                const y = -height / 2;

                shape.moveTo(x, y + radius);
                shape.lineTo(x, y + height - radius);
                shape.quadraticCurveTo(x, y + height, x + radius, y + height);
                shape.lineTo(x + width - radius, y + height);
                shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
                shape.lineTo(x + width, y + radius);
                shape.quadraticCurveTo(x + width, y, x + width - radius, y);
                shape.lineTo(x + radius, y);
                shape.quadraticCurveTo(x, y, x, y + radius);

                return shape;
            }

            createScreenCarousel(screenWidth, screenHeight, bodyDepth) {
                this.carouselCanvas = document.createElement('canvas');
                this.carouselCanvas.width = 640;
                this.carouselCanvas.height = 598;
                this.carouselCtx = this.carouselCanvas.getContext('2d');
                this.carouselCtx.imageSmoothingEnabled = false;

                this.pixelCanvas = document.createElement('canvas');
                this.pixelCanvas.width = 180;
                this.pixelCanvas.height = 120;
                this.pixelCtx = this.pixelCanvas.getContext('2d');

                this.carouselTexture = new THREE.CanvasTexture(this.carouselCanvas);
                this.carouselTexture.magFilter = THREE.NearestFilter;
                this.carouselTexture.minFilter = THREE.NearestFilter;
                this.carouselTexture.encoding = THREE.sRGBEncoding;

                this.carouselMaterial = new THREE.MeshBasicMaterial({
                    map: this.carouselTexture,
                    toneMapped: false,
                    transparent: true
                });

                const displayGeo = new THREE.PlaneGeometry(screenWidth * 0.94, screenHeight * 0.94);
                this.carouselScreen = new THREE.Mesh(displayGeo, this.carouselMaterial);
                this.carouselScreen.position.set(0, 0.8, bodyDepth / 2 + 0.145);
                this.machineGroup.add(this.carouselScreen);

                this.carouselStartTime = performance.now();
                this.carouselImages = CAROUSEL_PHOTOS.map((src) => {
                    const image = new Image();
                    const item = { image, loaded: false, src };
                    image.onload = () => {
                        item.loaded = true;
                        this.updateScreenCarousel(performance.now());
                    };
                    image.onerror = () => {
                        item.loaded = false;
                    };
                    image.src = src;
                    return item;
                });

                this.updateScreenCarousel(this.carouselStartTime);
            }

            easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            drawImageCover(ctx, image, x, y, width, height) {
                const sourceRatio = image.naturalWidth / image.naturalHeight;
                const targetRatio = width / height;
                let sx = 0;
                let sy = 0;
                let sw = image.naturalWidth;
                let sh = image.naturalHeight;

                if (sourceRatio > targetRatio) {
                    sw = image.naturalHeight * targetRatio;
                    sx = (image.naturalWidth - sw) / 2;
                } else {
                    sh = image.naturalWidth / targetRatio;
                    sy = (image.naturalHeight - sh) / 2;
                }

                ctx.drawImage(image, sx, sy, sw, sh, x, y, width, height);
            }

            drawCanvasRoundedRect(ctx, x, y, width, height, radius) {
                const r = Math.min(radius, width / 2, height / 2);
                ctx.beginPath();
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + width - r, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + r);
                ctx.lineTo(x + width, y + height - r);
                ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
                ctx.lineTo(x + r, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - r);
                ctx.lineTo(x, y + r);
                ctx.quadraticCurveTo(x, y, x + r, y);
                ctx.closePath();
            }

            createWishButtonTexture() {
                this.wishButtonCanvas = document.createElement('canvas');
                this.wishButtonCanvas.width = 512;
                this.wishButtonCanvas.height = 160;
                this.wishButtonCtx = this.wishButtonCanvas.getContext('2d');
                this.wishButtonCtx.imageSmoothingEnabled = false;
                this.wishButtonTextOffsetX = 0;

                const texture = new THREE.CanvasTexture(this.wishButtonCanvas);
                texture.magFilter = THREE.NearestFilter;
                texture.minFilter = THREE.NearestFilter;
                texture.encoding = THREE.sRGBEncoding;
                this.wishButtonTexture = texture;
                this.updateWishButtonTexture();
                return texture;
            }

            updateWishButtonTexture() {
                if (!this.wishButtonCtx || !this.wishButtonTexture) return;

                const canvas = this.wishButtonCanvas;
                const ctx = this.wishButtonCtx;
                const screenX = 30;
                const screenY = 24;
                const screenW = canvas.width - 60;
                const screenH = canvas.height - 48;
                const screenR = 16;

                ctx.clearRect(0, 0, canvas.width, canvas.height);

                const screen = ctx.createLinearGradient(0, screenY, 0, screenY + screenH);
                screen.addColorStop(0, '#050c13');
                screen.addColorStop(0.45, '#071522');
                screen.addColorStop(1, '#03080e');
                ctx.fillStyle = screen;
                this.drawCanvasRoundedRect(ctx, screenX, screenY, screenW, screenH, screenR);
                ctx.fill();

                ctx.save();
                this.drawCanvasRoundedRect(ctx, screenX, screenY, screenW, screenH, screenR);
                ctx.clip();

                ctx.fillStyle = 'rgba(91, 234, 219, 0.16)';
                for (let x = screenX + 8; x < screenX + screenW - 8; x += 6) {
                    ctx.fillRect(x, screenY + 8, 1, screenH - 16);
                }
                for (let y = screenY + 8; y < screenY + screenH - 8; y += 6) {
                    ctx.fillRect(screenX + 8, y, screenW - 16, 1);
                }

                ctx.fillStyle = 'rgba(1, 5, 9, 0.34)';
                for (let y = screenY; y < screenY + screenH; y += 5) {
                    ctx.fillRect(screenX, y, screenW, 2);
                }

                const glow = ctx.createRadialGradient(canvas.width * 0.48, canvas.height * 0.52, 18, canvas.width * 0.48, canvas.height * 0.52, 220);
                glow.addColorStop(0, 'rgba(83, 242, 227, 0.16)');
                glow.addColorStop(1, 'rgba(83, 242, 227, 0)');
                ctx.fillStyle = glow;
                ctx.fillRect(screenX, screenY, screenW, screenH);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '900 74px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                ctx.shadowColor = 'rgba(83, 242, 227, 0.88)';
                ctx.shadowBlur = 14;
                ctx.fillStyle = '#9ff1e5';

                const text = WISH_COPY.machineButton;
                const textWidth = ctx.measureText(text).width;
                const spacing = 110;
                const loopWidth = textWidth + spacing;
                const baseY = canvas.height / 2 + 4;

                ctx.fillText(text, this.wishButtonTextOffsetX, baseY);
                ctx.fillText(text, this.wishButtonTextOffsetX + loopWidth, baseY);

                this.wishButtonTextOffsetX -= 1.35;
                if (this.wishButtonTextOffsetX <= -loopWidth) {
                    this.wishButtonTextOffsetX += loopWidth;
                }

                ctx.shadowBlur = 0;
                ctx.restore();

                this.wishButtonTexture.needsUpdate = true;
            }

            buildWishButton(insertY, insertZ) {
                const group = new THREE.Group();
                group.name = 'wishButton';
                group.position.set(-0.82, insertY + 0.02, insertZ + 0.075);
                group.userData.role = 'wishButton';

                const buttonShape = this.createRoundedRectShape(1.56, 0.5, 0.12);
                const baseGeo = new THREE.ExtrudeGeometry(buttonShape, {
                    depth: 0.18,
                    bevelEnabled: true,
                    bevelSegments: 3,
                    bevelSize: 0.035,
                    bevelThickness: 0.035
                });
                baseGeo.translate(0, 0, -0.09);

                const baseMat = new THREE.MeshStandardMaterial({
                    color: 0x58b1cf,
                    roughness: 0.36,
                    metalness: 0.28,
                    emissive: 0x1c6f89,
                    emissiveIntensity: 0.16
                });
                const base = new THREE.Mesh(baseGeo, baseMat);
                base.castShadow = true;
                base.receiveShadow = true;
                base.userData.role = 'wishButton';
                group.add(base);

                const labelTex = this.createWishButtonTexture();
                const labelMat = new THREE.MeshBasicMaterial({
                    map: labelTex,
                    transparent: true,
                    side: THREE.DoubleSide,
                    depthTest: true,
                    depthWrite: false,
                    toneMapped: false
                });
                const label = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.48), labelMat);
                label.position.z = 0.17;
                label.renderOrder = 20;
                label.userData.role = 'wishButton';
                group.add(label);

                this.wishButtonGroup = group;
                this.machineGroup.add(group);
            }

            drawPixelPhoto(image, x, y, width, height) {
                const lowWidth = 210;
                const lowHeight = 196;
                if (this.pixelCanvas.width !== lowWidth || this.pixelCanvas.height !== lowHeight) {
                    this.pixelCanvas.width = lowWidth;
                    this.pixelCanvas.height = lowHeight;
                }

                this.pixelCtx.clearRect(0, 0, lowWidth, lowHeight);
                this.pixelCtx.imageSmoothingEnabled = true;
                this.pixelCtx.filter = 'contrast(1.12) saturate(1.05) brightness(1.04)';
                this.drawImageCover(this.pixelCtx, image, 0, 0, lowWidth, lowHeight);
                this.pixelCtx.filter = 'none';

                const ctx = this.carouselCtx;
                ctx.save();
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.clip();
                ctx.imageSmoothingEnabled = false;
                ctx.drawImage(this.pixelCanvas, x, y, width, height);

                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = 'rgba(47, 219, 255, 0.13)';
                ctx.fillRect(x, y, width, height);

                ctx.globalCompositeOperation = 'soft-light';
                ctx.fillStyle = 'rgba(0, 181, 255, 0.24)';
                ctx.fillRect(x, y, width, height);

                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = 'rgba(198, 246, 255, 0.13)';
                for (let yLine = y; yLine < y + height; yLine += 8) {
                    ctx.fillRect(x, yLine, width, 1);
                }

                ctx.fillStyle = 'rgba(0, 18, 54, 0.16)';
                for (let yLine = y + 4; yLine < y + height; yLine += 8) {
                    ctx.fillRect(x, yLine, width, 1);
                }

                ctx.fillStyle = 'rgba(132, 235, 255, 0.08)';
                for (let xLine = x; xLine < x + width; xLine += 14) {
                    ctx.fillRect(xLine, y, 1, height);
                }

                const vignette = ctx.createRadialGradient(x + width / 2, y + height / 2, width * 0.2, x + width / 2, y + height / 2, width * 0.68);
                vignette.addColorStop(0, 'rgba(255, 255, 255, 0)');
                vignette.addColorStop(1, 'rgba(0, 12, 42, 0.32)');
                ctx.fillStyle = vignette;
                ctx.fillRect(x, y, width, height);
                ctx.restore();
            }

            updateScreenCarousel(now = performance.now()) {
                if (!this.carouselCtx || !this.carouselTexture) return;

                const ctx = this.carouselCtx;
                const width = this.carouselCanvas.width;
                const height = this.carouselCanvas.height;
                const time = now * 0.001;
                const radius = 54;

                ctx.clearRect(0, 0, width, height);

                const loaded = (this.carouselImages || []).filter(item => item.loaded);
                const imageX = 0;
                const imageY = 0;
                const imageW = width;
                const imageH = height;

                ctx.save();
                this.drawCanvasRoundedRect(ctx, 0, 0, width, height, radius);
                ctx.clip();

                const bg = ctx.createLinearGradient(0, 0, width, height);
                bg.addColorStop(0, '#061827');
                bg.addColorStop(0.45, '#0c4c78');
                bg.addColorStop(1, '#07131f');
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, width, height);

                if (loaded.length) {
                    const holdDuration = 1450;
                    const transitionDuration = 2050;
                    const cycleDuration = holdDuration + transitionDuration;
                    const elapsed = now - this.carouselStartTime;
                    const currentIndex = Math.floor(elapsed / cycleDuration) % loaded.length;
                    const nextIndex = (currentIndex + 1) % loaded.length;
                    const phaseTime = elapsed % cycleDuration;

                    if (phaseTime < holdDuration) {
                        this.drawPixelPhoto(loaded[currentIndex].image, imageX, imageY, imageW, imageH);
                    } else {
                        const progress = this.easeInOutCubic((phaseTime - holdDuration) / transitionDuration);
                        const travel = imageW;
                        this.drawPixelPhoto(loaded[currentIndex].image, imageX - progress * travel, imageY, imageW, imageH);
                        this.drawPixelPhoto(loaded[nextIndex].image, imageX + (1 - progress) * travel, imageY, imageW, imageH);
                    }
                } else {
                    ctx.fillStyle = 'rgba(92, 208, 255, 0.18)';
                    for (let y = imageY; y < imageY + imageH; y += 12) {
                        ctx.fillRect(imageX, y, imageW, 3);
                    }
                }

                const glowX = (Math.sin(time * 1.8) * 0.5 + 0.5) * width;
                const glow = ctx.createRadialGradient(glowX, height * 0.36, 20, glowX, height * 0.36, 260);
                glow.addColorStop(0, 'rgba(167, 247, 255, 0.2)');
                glow.addColorStop(1, 'rgba(167, 247, 255, 0)');
                ctx.fillStyle = glow;
                ctx.fillRect(0, 0, width, height);

                ctx.fillStyle = 'rgba(0, 8, 20, 0.22)';
                for (let y = 0; y < height; y += 6) {
                    ctx.fillRect(0, y, width, 1.5);
                }

                ctx.fillStyle = 'rgba(130, 236, 255, 0.07)';
                for (let x = 0; x < width; x += 14) ctx.fillRect(x, 0, 1, height);

                ctx.strokeStyle = 'rgba(155, 242, 255, 0.32)';
                ctx.lineWidth = 2;
                this.drawCanvasRoundedRect(ctx, 10, 10, width - 20, height - 20, radius - 10);
                ctx.stroke();

                ctx.fillStyle = 'rgba(220, 249, 255, 0.16)';
                ctx.beginPath();
                ctx.moveTo(width * 0.1, 24);
                ctx.lineTo(width * 0.9, 24);
                ctx.lineTo(width * 0.7, 96);
                ctx.lineTo(width * 0.04, 120);
                ctx.closePath();
                ctx.fill();
                ctx.restore();

                this.carouselTexture.needsUpdate = true;
            }

            buildMachine() {
                const bodyWidth = 4.0;
                const bodyHeight = 5.5;
                const bodyDepth = 3.5;
                const cornerRadius = 0.4;

                const bodyShape = this.createRoundedRectShape(bodyWidth, bodyHeight, cornerRadius);
                const extrudeSettings = {
                    depth: bodyDepth,
                    bevelEnabled: true,
                    bevelSegments: 4,
                    steps: 2,
                    bevelSize: 0.05,
                    bevelThickness: 0.05
                };
                const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, extrudeSettings);
                bodyGeo.translate(0, 0, -bodyDepth/2);

                this.body = new THREE.Mesh(bodyGeo, this.matBody);
                this.body.castShadow = true;
                this.body.receiveShadow = true;
                this.machineGroup.add(this.body);

                const screenWidth = 3.0;
                const screenHeight = 2.8;
                const screenRadius = 0.2;

                const screenShape = this.createRoundedRectShape(screenWidth, screenHeight, screenRadius);
                const screenGeo = new THREE.ExtrudeGeometry(screenShape, { depth: 0.1, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02 });
                screenGeo.translate(0, 0, 0);

                this.screen = new THREE.Mesh(screenGeo, this.matScreen);
                this.screen.position.set(0, 0.8, bodyDepth/2 + 0.01);
                this.machineGroup.add(this.screen);
                this.createScreenCarousel(screenWidth, screenHeight, bodyDepth);

                this.buildTopSignBoard(bodyWidth, bodyHeight, bodyDepth);

                const knobRadius = 0.8;
                const knobDepth = 0.5;
                const knobGeo = new THREE.CylinderGeometry(knobRadius, knobRadius, knobDepth, 8);
                this.knob = new THREE.Mesh(knobGeo, this.matBlueHardware);
                this.knob.rotation.z = Math.PI / 2;
                this.knob.position.set(bodyWidth/2 + knobDepth/2 - 0.05, -1.2, 0);
                this.knob.castShadow = true;
                this.machineGroup.add(this.knob);

                const knobIndicatorGeo = new THREE.BoxGeometry(0.2, 0.2, 0.4);
                const knobIndicator = new THREE.Mesh(knobIndicatorGeo, this.matBlueDark);
                knobIndicator.position.set(0, knobRadius - 0.1, 0);
                this.knob.add(knobIndicator);
                this.buildKnobSurfaceArrow(knobRadius, knobDepth);

                const bevelThickness = 0.05;
                const bumpWidth = bodyWidth - (bevelThickness * 2);
                const bumpHeight = 1.6;
                const bumpDepth = 1.4;
                const slantHeight = 0.7;

                const br = 0.15;
                const bumpShape = new THREE.Shape();
                bumpShape.moveTo(0, 0);
                bumpShape.lineTo(bumpDepth - br, 0);

                bumpShape.quadraticCurveTo(bumpDepth, 0, bumpDepth, br);
                bumpShape.lineTo(bumpDepth, slantHeight - br);

                const slantDx = -bumpDepth;
                const slantDy = bumpHeight - slantHeight;
                const slantLen = Math.sqrt(slantDx * slantDx + slantDy * slantDy);
                const uX = slantDx / slantLen;
                const uY = slantDy / slantLen;
                const endX = bumpDepth + uX * br;
                const endY = slantHeight + uY * br;

                bumpShape.quadraticCurveTo(bumpDepth, slantHeight, endX, endY);
                bumpShape.lineTo(0, bumpHeight);
                bumpShape.lineTo(0, 0);

                const bumpExtrudeSettings = {
                    depth: bumpWidth,
                    bevelEnabled: true,
                    bevelSegments: 4,
                    steps: 1,
                    bevelSize: bevelThickness,
                    bevelThickness: bevelThickness
                };

                const bumpGeo = new THREE.ExtrudeGeometry(bumpShape, bumpExtrudeSettings);
                bumpGeo.rotateY(-Math.PI / 2);
                bumpGeo.translate(bumpWidth / 2, -bumpHeight / 2, 0);

                const bumpMesh = new THREE.Mesh(bumpGeo, this.matBody);
                bumpMesh.position.set(0, -bodyHeight/2 + bumpHeight/2, bodyDepth/2 - 0.05);
                bumpMesh.castShadow = true;
                bumpMesh.receiveShadow = true;
                this.machineGroup.add(bumpMesh);
                this.buildSlopeEasonLogo();

                const matHole = new THREE.MeshBasicMaterial({ color: 0x050505 });

                const slotWidth = 2.8;
                const slotHeight = 0.12;
                const slotY = -bodyHeight/2 + bumpHeight + 0.15;
                const slotZ = bodyDepth/2 + 0.05;

                const slotHoleGeo = new THREE.BoxGeometry(slotWidth, slotHeight, 0.2);
                const slotHole = new THREE.Mesh(slotHoleGeo, matHole);
                slotHole.position.set(0, slotY, slotZ);
                this.machineGroup.add(slotHole);

                const slotFrameGeo = new THREE.BoxGeometry(slotWidth + 0.15, slotHeight + 0.1, 0.1);
                const slotFrame = new THREE.Mesh(slotFrameGeo, this.matKnob);
                slotFrame.position.set(0, slotY, slotZ - 0.05);
                this.machineGroup.add(slotFrame);

                const insertSlotWidth = 1.0;
                const insertSlotHeight = 0.08;
                const insertY = -bodyHeight/2 + slantHeight / 2;
                const insertZ = bodyDepth/2 - 0.05 + bumpDepth + 0.05;

                const insertHoleGeo = new THREE.BoxGeometry(insertSlotWidth, insertSlotHeight, 0.2);
                const insertHole = new THREE.Mesh(insertHoleGeo, matHole);
                insertHole.position.set(bumpWidth/4, insertY, insertZ);
                this.machineGroup.add(insertHole);
                this.wishInsertSlot = insertHole;

                const insertBaseGeo = new THREE.BoxGeometry(insertSlotWidth + 0.15, insertSlotHeight + 0.1, 0.1);
                const insertBase = new THREE.Mesh(insertBaseGeo, this.matKnob);
                insertBase.position.set(bumpWidth/4, insertY, insertZ - 0.05);
                this.machineGroup.add(insertBase);

                this.buildWishButton(insertY, insertZ);
                this.buildCard(bodyDepth, slotY);
                this.buildSideStickerCollage(bodyWidth, bodyHeight, bodyDepth);
            }

            createSlopeEasonLogoTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 192;
                const ctx = canvas.getContext('2d');

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '900 110px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                ctx.lineJoin = 'round';
                ctx.miterLimit = 2;

                ctx.shadowColor = 'rgba(82, 217, 230, 0.58)';
                ctx.shadowBlur = 14;
                ctx.strokeStyle = 'rgba(4, 15, 24, 0.96)';
                ctx.lineWidth = 24;
                ctx.strokeText('Eason', 256, 96);

                ctx.shadowBlur = 12;
                ctx.strokeStyle = 'rgba(119, 229, 236, 0.98)';
                ctx.lineWidth = 14;
                ctx.strokeText('Eason', 256, 96);

                ctx.shadowBlur = 0;
                ctx.fillStyle = 'rgba(255, 252, 229, 1)';
                ctx.fillText('Eason', 256, 96);

                ctx.globalAlpha = 0.46;
                ctx.strokeStyle = 'rgba(23, 72, 97, 0.72)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(106, 150);
                ctx.quadraticCurveTo(256, 174, 406, 150);
                ctx.stroke();

                const texture = new THREE.CanvasTexture(canvas);
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearFilter;
                return texture;
            }

            buildSlopeEasonLogo() {
                const texture = this.createSlopeEasonLogoTexture();
                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    depthTest: false,
                    depthWrite: false,
                    toneMapped: false,
                    side: THREE.DoubleSide
                });
                const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.72, 0.64), material);
                logo.name = 'slope-eason-logo';
                logo.position.set(0.92, -1.74, 2.62);
                logo.rotation.set(-1.0, 0, -0.08);
                logo.renderOrder = 140;
                this.machineGroup.add(logo);
            }

            createKnobArrowTexture() {
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');
                const cx = 256;
                const cy = 256;
                const radius = 158;
                const start = -Math.PI * 0.78;
                const end = Math.PI * 0.86;
                const endX = cx + Math.cos(end) * radius;
                const endY = cy + Math.sin(end) * radius;
                const tangent = end + Math.PI / 2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.shadowColor = 'rgba(125, 255, 240, 0.96)';
                ctx.shadowBlur = 24;
                ctx.strokeStyle = 'rgba(250, 255, 252, 0.96)';
                ctx.lineWidth = 34;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, start, end, false);
                ctx.stroke();

                ctx.fillStyle = 'rgba(250, 255, 252, 0.98)';
                ctx.beginPath();
                ctx.moveTo(endX + Math.cos(tangent) * 42, endY + Math.sin(tangent) * 42);
                ctx.lineTo(endX + Math.cos(tangent + 2.45) * 36, endY + Math.sin(tangent + 2.45) * 36);
                ctx.lineTo(endX + Math.cos(tangent - 2.45) * 36, endY + Math.sin(tangent - 2.45) * 36);
                ctx.closePath();
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.strokeStyle = 'rgba(52, 233, 222, 0.78)';
                ctx.lineWidth = 9;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, start, end, false);
                ctx.stroke();

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(cx, cy, radius - 21, start + 0.18, end - 0.3, false);
                ctx.stroke();

                const texture = new THREE.CanvasTexture(canvas);
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearFilter;
                return texture;
            }

            buildKnobSurfaceArrow(knobRadius, knobDepth) {
                if (!this.knob) return;
                const texture = this.createKnobArrowTexture();
                this.knobArrowMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.92,
                    depthWrite: false,
                    toneMapped: false,
                    side: THREE.DoubleSide
                });

                this.knobSurfaceArrow = new THREE.Mesh(
                    new THREE.PlaneGeometry(knobRadius * 1.58, knobRadius * 1.58),
                    this.knobArrowMaterial
                );
                this.knobSurfaceArrow.rotation.x = Math.PI / 2;
                this.knobSurfaceArrow.position.set(0, -knobDepth / 2 - 0.026, 0);
                this.knobSurfaceArrow.renderOrder = 90;
                this.knobSurfaceArrow.visible = false;
                this.knob.add(this.knobSurfaceArrow);
            }

            setKnobGuidanceVisible(visible) {
                if (!this.knobSurfaceArrow) return;
                this.knobSurfaceArrow.visible = Boolean(visible);
                if (this.knobArrowMaterial) {
                    this.knobArrowMaterial.opacity = visible ? 0.94 : 0;
                }
            }

            async createOutlinedStickerTexture(source) {
                const image = await this.loadCardAsset(source);
                const canvas = document.createElement('canvas');
                canvas.width = 512;
                canvas.height = 512;
                const ctx = canvas.getContext('2d');
                const ratio = image.naturalWidth && image.naturalHeight
                    ? image.naturalWidth / image.naturalHeight
                    : 1;
                const maxSize = 352;
                const drawWidth = ratio >= 1 ? maxSize : maxSize * ratio;
                const drawHeight = ratio >= 1 ? maxSize / ratio : maxSize;
                const x = (canvas.width - drawWidth) / 2;
                const y = (canvas.height - drawHeight) / 2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.shadowColor = 'rgba(3, 12, 24, 0.22)';
                ctx.shadowBlur = 16;
                ctx.shadowOffsetY = 8;
                ctx.filter = 'brightness(0) invert(1)';
                for (let index = 0; index < 28; index++) {
                    const angle = (Math.PI * 2 * index) / 28;
                    const offset = index % 2 === 0 ? 13 : 8;
                    ctx.drawImage(image, x + Math.cos(angle) * offset, y + Math.sin(angle) * offset, drawWidth, drawHeight);
                }
                ctx.filter = 'none';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 4;
                ctx.drawImage(image, x, y, drawWidth, drawHeight);

                const texture = new THREE.CanvasTexture(canvas);
                texture.encoding = THREE.sRGBEncoding;
                texture.magFilter = THREE.LinearFilter;
                texture.minFilter = THREE.LinearFilter;
                return texture;
            }

            buildSideStickerCollage(bodyWidth, bodyHeight, bodyDepth) {
                const sideGroup = new THREE.Group();
                sideGroup.name = 'generated-sticker-side-collage';
                this.sideStickerGroup = sideGroup;
                this.machineGroup.add(sideGroup);

                const stickerClusterCenterY = 1.18;
                const stickerClusterCenterZ = 0.42;
                const placements = [
                    { source: WISH_STICKERS[0], y: 2.0, z: 0.7, size: 1.16, rotation: -0.22 },
                    { source: WISH_STICKERS[4], y: 1.84, z: 0.1, size: 1.1, rotation: 0.18 },
                    { source: WISH_STICKERS[7], y: 1.68, z: 1.08, size: 1.04, rotation: -0.1 },
                    { source: WISH_STICKERS[2], y: 1.48, z: 0.48, size: 1.14, rotation: 0.26 },
                    { source: WISH_STICKERS[9], y: 1.28, z: 0.86, size: 1.08, rotation: 0.12 },
                    { source: WISH_STICKERS[1], y: 1.16, z: -0.06, size: 1.2, rotation: -0.18 },
                    { source: WISH_STICKERS[6], y: 0.96, z: 1.12, size: 1.02, rotation: 0.3 },
                    { source: WISH_STICKERS[5], y: 0.84, z: 0.3, size: 1.16, rotation: -0.06 },
                    { source: WISH_STICKERS[3], y: 0.66, z: 0.72, size: 1.1, rotation: -0.3 },
                    { source: WISH_STICKERS[8], y: 0.52, z: -0.06, size: 1.08, rotation: 0.2 },
                    { source: WISH_STICKERS[0], y: 0.42, z: 1.02, size: 0.98, rotation: -0.14 },
                    { source: WISH_STICKERS[4], y: 1.9, z: -0.36, size: 0.96, rotation: 0.28 },
                    { source: WISH_STICKERS[7], y: 1.36, z: -0.46, size: 0.98, rotation: -0.18 },
                    { source: WISH_STICKERS[2], y: 0.78, z: -0.36, size: 0.94, rotation: 0.22 },
                    { source: WISH_STICKERS[9], y: 0.34, z: 0.34, size: 0.96, rotation: -0.26 }
                ].map(placement => Object.assign({}, placement, {
                    y: stickerClusterCenterY + (placement.y - stickerClusterCenterY) * 1.08,
                    z: stickerClusterCenterZ + (placement.z - stickerClusterCenterZ) * 1.1 - 0.18
                }));

                placements.forEach((placement, index) => {
                    this.createOutlinedStickerTexture(placement.source)
                        .then((texture) => {
                            if (!this.sideStickerGroup) return;
                            const material = new THREE.MeshBasicMaterial({
                                map: texture,
                                transparent: true,
                                depthWrite: false,
                                toneMapped: false,
                                side: THREE.DoubleSide
                            });
                            const sticker = new THREE.Mesh(new THREE.PlaneGeometry(placement.size, placement.size), material);
                            sticker.position.set(bodyWidth / 2 + 0.074 + index * 0.004, placement.y, placement.z);
                            sticker.rotation.set(0, Math.PI / 2, placement.rotation);
                            sticker.renderOrder = 34 + index;
                            sideGroup.add(sticker);
                        })
                        .catch(() => {});
                });
            }

            updateSignText() {
                if (!this.signCtx || !this.signTex) return;

                const width = 512;
                const height = 128;
                const ctx = this.signCtx;

                ctx.fillStyle = '#050505';
                ctx.fillRect(0, 0, width, height);

                ctx.fillStyle = 'rgba(0, 255, 204, 0.1)';
                for(let i=0; i<width; i+=4) ctx.fillRect(i, 0, 1, height);
                for(let i=0; i<height; i+=4) ctx.fillRect(0, i, width, 1);

                const neonColor = '#00ffcc';
                ctx.shadowColor = neonColor;
                ctx.shadowBlur = 15;
                ctx.fillStyle = neonColor;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 44px "Courier New", Courier, monospace';
                ctx.imageSmoothingEnabled = false;

                const text = 'Eason 生日签抽卡机';
                const textWidth = ctx.measureText(text).width;
                const spacing = 100;
                const loopWidth = textWidth + spacing;

                ctx.fillText(text, this.signTextOffsetX, 64);
                ctx.fillText(text, this.signTextOffsetX + loopWidth, 64);

                ctx.shadowBlur = 0;

                this.signTextOffsetX -= 1.5;
                if (this.signTextOffsetX <= -loopWidth) {
                    this.signTextOffsetX += loopWidth;
                }

                this.signTex.needsUpdate = true;
            }

            buildTopSignBoard(bw, bh, bd) {
                const signGroup = new THREE.Group();
                signGroup.position.set(0, bh/2 + 0.8, bd/2 - 0.5);

                const boardWidth = 3.2;
                const boardHeight = 1.2;
                const boardDepth = 0.3;

                const frameShape = this.createRoundedRectShape(boardWidth, boardHeight, 0.2);
                const bevelThickness = 0.06;
                const frameGeo = new THREE.ExtrudeGeometry(frameShape, {depth: boardDepth, bevelEnabled: true, bevelSize: bevelThickness, bevelThickness: bevelThickness});
                frameGeo.translate(0,0, -boardDepth/2);

                const matFrame = new THREE.MeshStandardMaterial({ color: 0x4d95b4, roughness: 0.56 });
                const frame = new THREE.Mesh(frameGeo, matFrame);
                frame.castShadow = true;
                signGroup.add(frame);

                const screenWidth = boardWidth - 0.4;
                const screenHeight = boardHeight - 0.4;
                const screenGeo = new THREE.PlaneGeometry(screenWidth, screenHeight);

                this.signCanvas = document.createElement('canvas');
                this.signCanvas.width = 512;
                this.signCanvas.height = 128;
                this.signCtx = this.signCanvas.getContext('2d');
                this.signTextOffsetX = 0;

                this.signTex = new THREE.CanvasTexture(this.signCanvas);
                this.signTex.magFilter = THREE.NearestFilter;
                this.signTex.minFilter = THREE.NearestFilter;

                this.updateSignText();

                const matSignScreen = new THREE.MeshPhysicalMaterial({
                    color: 0x000000,
                    metalness: 0.9,
                    roughness: 0.1,
                    envMap: this.scene.environment,
                    envMapIntensity: 1.0,
                    clearcoat: 1.0,
                    clearcoatRoughness: 0.1,
                    emissive: 0xffffff,
                    emissiveMap: this.signTex
                });

                const signScreen = new THREE.Mesh(screenGeo, matSignScreen);
                signScreen.position.set(0, 0, boardDepth/2 + bevelThickness + 0.01);
                signGroup.add(signScreen);

                const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.8);
                const matPole = new THREE.MeshStandardMaterial({color: 0x888888, metalness: 0.8, roughness: 0.2});
                const poleLeft = new THREE.Mesh(poleGeo, matPole);
                poleLeft.position.set(-1, -boardHeight/2 - 0.2, 0);
                const poleRight = new THREE.Mesh(poleGeo, matPole);
                poleRight.position.set(1, -boardHeight/2 - 0.2, 0);
                signGroup.add(poleLeft);
                signGroup.add(poleRight);

                this.machineGroup.add(signGroup);
            }

            buildCard(bd, slotY) {
                const cardWidth = 1.95;
                const cardHeight = 2.78;
                const cardGeo = new THREE.PlaneGeometry(cardWidth, cardHeight);

                this.cardCanvas = document.createElement('canvas');
                this.cardCanvas.width = 512;
                this.cardCanvas.height = 728;
                this.cardCtx = this.cardCanvas.getContext('2d');

                this.cardTexture = new THREE.CanvasTexture(this.cardCanvas);
                this.cardTexture.encoding = THREE.sRGBEncoding;
                this.cardTexture.magFilter = THREE.LinearFilter;
                this.cardTexture.minFilter = THREE.LinearFilter;

                this.drawFallbackWishCard();

                const matCardTex = new THREE.MeshStandardMaterial({
                    map: this.cardTexture,
                    transparent: true,
                    opacity: 1,
                    side: THREE.DoubleSide,
                    roughness: 0.48,
                    metalness: 0.02
                });

                this.card = new THREE.Mesh(cardGeo, matCardTex);
                this.card.rotation.x = -Math.PI / 2 + 0.1;
                this.card.position.set(0, slotY, bd/2 - 1);
                this.card.renderOrder = 160;
                this.card.visible = false;

                this.cardSlotY = slotY;
                this.machineGroup.add(this.card);
            }

            loadCardAsset(src) {
                if (!this.assetCache) this.assetCache = new Map();
                const source = String(src || '').trim();
                if (!source) return Promise.reject(new Error('Missing card asset source'));
                if (this.assetCache.has(source)) return this.assetCache.get(source);

                const loadSingleAsset = (url) => new Promise((resolve, reject) => {
                    const image = new Image();
                    image.decoding = 'async';
                    image.loading = 'eager';
                    const timer = window.setTimeout(() => reject(new Error(`Timed out loading ${url}`)), 9000);
                    image.onload = () => {
                        window.clearTimeout(timer);
                        resolve(image);
                    };
                    image.onerror = () => {
                        window.clearTimeout(timer);
                        reject(new Error(`Failed to load ${url}`));
                    };
                    image.src = url;
                });

                const pathEncoded = source
                    .split('/')
                    .map(part => encodeURIComponent(part))
                    .join('/');
                const candidates = [...new Set([source, encodeURI(source), pathEncoded])];
                const promise = candidates
                    .reduce((chain, candidate) => chain.catch(() => loadSingleAsset(candidate)), Promise.reject())
                    .catch(error => {
                        this.assetCache.delete(source);
                        throw error;
                    });

                this.assetCache.set(source, promise);
                return promise;
            }

            async loadFirstAvailableAsset(sources) {
                for (const source of sources.filter(Boolean)) {
                    try {
                        return await this.loadCardAsset(source);
                    } catch (error) {}
                }
                return null;
            }

            drawCardTextLines(ctx, lines, x, y, lineHeight) {
                lines.forEach((line, index) => {
                    ctx.fillText(line, x, y + index * lineHeight);
                });
            }

            drawDecorSticker(ctx, image, x, y, size, rotation = 0, alpha = 0.86) {
                if (!image) return;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(x, y);
                ctx.rotate(rotation);
                ctx.drawImage(image, -size / 2, -size / 2, size, size);
                ctx.restore();
            }

            drawDecorImage(ctx, image, x, y, size, rotation = 0, alpha = 0.62) {
                if (!image) return;
                const ratio = image.naturalWidth && image.naturalHeight
                    ? image.naturalWidth / image.naturalHeight
                    : 1;
                const drawWidth = ratio >= 1 ? size : size * ratio;
                const drawHeight = ratio >= 1 ? size / ratio : size;

                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(x, y);
                ctx.rotate(rotation);
                ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
                ctx.shadowBlur = 7;
                ctx.shadowOffsetY = 3;
                ctx.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
                ctx.restore();
            }

            drawPaperGrain(ctx, x, y, width, height, seed = 0, dark = false) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.clip();

                ctx.globalAlpha = dark ? 0.09 : 0.12;
                ctx.fillStyle = dark ? '#fff8ea' : '#111827';
                for (let i = 0; i < 900; i++) {
                    const px = x + ((seed + i * 37) % width);
                    const py = y + ((seed * 5 + i * 53) % height);
                    const size = i % 7 === 0 ? 1.4 : 0.8;
                    ctx.fillRect(px, py, size, size);
                }

                ctx.globalAlpha = dark ? 0.07 : 0.1;
                ctx.strokeStyle = dark ? '#fff8ea' : '#25313d';
                ctx.lineWidth = 0.7;
                for (let lineY = y + 5; lineY < y + height; lineY += 9) {
                    ctx.beginPath();
                    ctx.moveTo(x, lineY + ((seed + lineY) % 3) * 0.3);
                    ctx.lineTo(x + width, lineY + ((seed + lineY) % 5) * 0.22);
                    ctx.stroke();
                }

                ctx.globalAlpha = dark ? 0.05 : 0.07;
                for (let lineX = x + 3; lineX < x + width; lineX += 13) {
                    ctx.beginPath();
                    ctx.moveTo(lineX, y);
                    ctx.lineTo(lineX + ((seed + lineX) % 4) * 0.18, y + height);
                    ctx.stroke();
                }
                ctx.restore();
            }

            drawPaperSlip(ctx, x, y, width, height, text, rotation = 0, options = {}) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                ctx.fillStyle = options.fill || 'rgba(247, 243, 233, 0.94)';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
                ctx.shadowBlur = 6;
                ctx.shadowOffsetY = 3;
                ctx.fillRect(-width / 2, -height / 2, width, height);
                ctx.shadowColor = 'transparent';
                ctx.strokeStyle = options.stroke || 'rgba(31, 41, 55, 0.18)';
                ctx.lineWidth = 1;
                ctx.strokeRect(-width / 2, -height / 2, width, height);
                ctx.fillStyle = options.color || '#172033';
                ctx.font = options.font || '700 13px "Times New Roman", "Songti SC", serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(text, 0, 1);
                ctx.restore();
            }

            drawFineSpark(ctx, x, y, size, color, alpha = 0.65) {
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = color;
                ctx.lineWidth = 1.2;
                for (let index = 0; index < 4; index++) {
                    ctx.save();
                    ctx.translate(x, y);
                    ctx.rotate(index * Math.PI / 4);
                    ctx.beginPath();
                    ctx.moveTo(-size, 0);
                    ctx.lineTo(size, 0);
                    ctx.stroke();
                    ctx.restore();
                }
                ctx.restore();
            }

            drawPressedLeafSticker(ctx, x, y, size, rotation, theme, dark = false, alpha = 0.42) {
                const leafColor = blendRgb(theme, dark ? { r: 255, g: 248, b: 236 } : { r: 31, g: 45, b: 58 }, dark ? 0.46 : 0.3);
                const paperTint = dark ? 'rgba(255, 248, 236, 0.3)' : 'rgba(255, 252, 244, 0.48)';
                const strokeColor = rgbToCss(leafColor, dark ? 0.74 : 0.66);

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                ctx.globalAlpha = alpha;

                ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
                ctx.shadowBlur = 7;
                ctx.fillStyle = paperTint;
                this.drawCanvasRoundedRect(ctx, -size * 0.56, -size * 0.34, size * 1.12, size * 0.68, 5);
                ctx.fill();
                ctx.shadowColor = 'transparent';
                ctx.strokeStyle = dark ? 'rgba(255, 248, 236, 0.2)' : 'rgba(22, 32, 51, 0.16)';
                ctx.lineWidth = 1;
                this.drawCanvasRoundedRect(ctx, -size * 0.56, -size * 0.34, size * 1.12, size * 0.68, 5);
                ctx.stroke();

                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 1.45;
                ctx.beginPath();
                ctx.moveTo(-size * 0.34, size * 0.25);
                ctx.quadraticCurveTo(-size * 0.04, -size * 0.08, size * 0.38, -size * 0.26);
                ctx.stroke();

                [
                    { x: -0.2, y: 0.11, angle: -0.9, scale: 0.34 },
                    { x: -0.02, y: -0.02, angle: 0.86, scale: 0.3 },
                    { x: 0.16, y: -0.13, angle: -0.78, scale: 0.28 }
                ].forEach((leaf) => {
                    ctx.save();
                    ctx.translate(size * leaf.x, size * leaf.y);
                    ctx.rotate(leaf.angle);
                    ctx.fillStyle = rgbToCss(leafColor, dark ? 0.54 : 0.48);
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(size * leaf.scale * 0.2, -size * leaf.scale * 0.32, size * leaf.scale * 0.58, -size * leaf.scale * 0.24, size * leaf.scale * 0.64, 0);
                    ctx.bezierCurveTo(size * leaf.scale * 0.48, size * leaf.scale * 0.18, size * leaf.scale * 0.16, size * leaf.scale * 0.24, 0, 0);
                    ctx.fill();
                    ctx.restore();
                });

                ctx.restore();
            }

            drawTemplatePanelPattern(ctx, layout, x, y, width, height, theme, ink, dark = false, seed = 0) {
                const accent = blendRgb(theme, dark ? { r: 255, g: 248, b: 236 } : { r: 20, g: 30, b: 44 }, dark ? 0.38 : 0.24);
                ctx.save();
                ctx.beginPath();
                ctx.rect(x, y, width, height);
                ctx.clip();

                if (layout === 'echo') {
                    const signal = dark ? 'rgba(135, 247, 255, 0.58)' : 'rgba(0, 124, 184, 0.42)';
                    const signalSoft = dark ? 'rgba(86, 216, 255, 0.12)' : 'rgba(0, 102, 184, 0.1)';
                    const hot = dark ? 'rgba(255, 92, 196, 0.2)' : 'rgba(255, 74, 178, 0.12)';

                    ctx.globalCompositeOperation = 'screen';
                    ctx.globalAlpha = 0.72;
                    ctx.fillStyle = signalSoft;
                    for (let lineX = x + 10; lineX < x + width; lineX += 18) {
                        ctx.fillRect(lineX, y, 1, height);
                    }
                    for (let lineY = y + 8; lineY < y + height; lineY += 16) {
                        ctx.fillRect(x, lineY, width, 1);
                    }
                    ctx.globalAlpha = 1;
                    ctx.globalCompositeOperation = 'source-over';

                    const safePanelX = x + 24;
                    const safePanelY = y + 22;
                    const safePanelW = 304;
                    const safePanelH = 208;
                    const safePanel = ctx.createLinearGradient(safePanelX, safePanelY, safePanelX + safePanelW, safePanelY + safePanelH);
                    safePanel.addColorStop(0, dark ? 'rgba(2, 16, 37, 0.62)' : 'rgba(240, 255, 255, 0.46)');
                    safePanel.addColorStop(1, dark ? 'rgba(1, 8, 26, 0.34)' : 'rgba(232, 255, 255, 0.24)');
                    ctx.fillStyle = safePanel;
                    this.drawCanvasRoundedRect(ctx, safePanelX, safePanelY, safePanelW, safePanelH, 11);
                    ctx.fill();
                    ctx.strokeStyle = dark ? 'rgba(128, 247, 255, 0.28)' : 'rgba(21, 116, 177, 0.18)';
                    ctx.lineWidth = 1.4;
                    this.drawCanvasRoundedRect(ctx, safePanelX, safePanelY, safePanelW, safePanelH, 11);
                    ctx.stroke();

                    const moduleX = x + width - 172;
                    const moduleY = y + 68;
                    const moduleW = 132;
                    const moduleH = 128;
                    const moduleFill = ctx.createLinearGradient(moduleX, moduleY, moduleX + moduleW, moduleY + moduleH);
                    moduleFill.addColorStop(0, dark ? 'rgba(4, 21, 46, 0.28)' : 'rgba(236, 255, 255, 0.2)');
                    moduleFill.addColorStop(1, dark ? 'rgba(1, 8, 23, 0.08)' : 'rgba(218, 247, 255, 0.06)');
                    ctx.fillStyle = moduleFill;
                    this.drawCanvasRoundedRect(ctx, moduleX, moduleY, moduleW, moduleH, 15);
                    ctx.fill();
                    ctx.strokeStyle = dark ? 'rgba(129, 246, 255, 0.22)' : 'rgba(20, 117, 180, 0.14)';
                    ctx.lineWidth = 1.25;
                    this.drawCanvasRoundedRect(ctx, moduleX, moduleY, moduleW, moduleH, 15);
                    ctx.stroke();

                    ctx.save();
                    this.drawCanvasRoundedRect(ctx, moduleX + 4, moduleY + 4, moduleW - 8, moduleH - 8, 12);
                    ctx.clip();
                    ctx.globalCompositeOperation = 'screen';
                    ctx.strokeStyle = signal;
                    ctx.lineWidth = 1.15;
                    for (let row = 0; row < 3; row++) {
                        const baseY = moduleY + 26 + row * 26;
                        ctx.beginPath();
                        for (let px = moduleX + 10; px <= moduleX + moduleW - 12; px += 6) {
                            const wave = Math.sin((px + seed * 0.03 + row * 41) * 0.052) * 4.2;
                            if (px === moduleX + 10) ctx.moveTo(px, baseY + wave);
                            else ctx.lineTo(px, baseY + wave);
                        }
                        ctx.globalAlpha = 0.12 + row * 0.035;
                        ctx.stroke();
                    }

                    ctx.strokeStyle = dark ? 'rgba(130, 248, 255, 0.2)' : 'rgba(20, 117, 180, 0.16)';
                    ctx.lineWidth = 1.1;
                    [28, 50, 72].forEach((radius) => {
                        ctx.beginPath();
                        ctx.arc(moduleX + moduleW - 8, moduleY + moduleH * 0.5, radius, -0.72, 0.72);
                        ctx.stroke();
                    });

                    for (let index = 0; index < 10; index++) {
                        const px = moduleX + 20 + index * 9;
                        const barHeight = 8 + ((seed + index * 17) % 28);
                        ctx.fillStyle = index % 6 === 0 ? hot : signal;
                        ctx.globalAlpha = index % 3 === 0 ? 0.22 : 0.14;
                        ctx.fillRect(px, moduleY + moduleH - 22 - barHeight, 3, barHeight);
                    }
                    ctx.restore();

                    ctx.globalCompositeOperation = 'screen';
                    ctx.fillStyle = hot;
                    ctx.globalAlpha = 0.16;
                    ctx.fillRect(moduleX + 22, moduleY + 18, 64, 5);
                    ctx.fillStyle = signal;
                    ctx.globalAlpha = 0.12;
                    ctx.fillRect(moduleX + 42, moduleY + moduleH - 38, 58, 4);
                    ctx.globalAlpha = 1;
                    ctx.globalCompositeOperation = 'source-over';
                } else if (layout === 'ticket') {
                    ctx.fillStyle = dark ? 'rgba(255, 248, 236, 0.08)' : 'rgba(22, 32, 51, 0.07)';
                    ctx.fillRect(x + 24, y + 26, width - 48, 28);
                    ctx.fillStyle = dark ? 'rgba(255, 248, 236, 0.2)' : 'rgba(22, 32, 51, 0.16)';
                    for (let px = x + 28; px < x + width - 28; px += 18) {
                        ctx.beginPath();
                        ctx.arc(px, y + 2, 4, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.strokeStyle = dark ? 'rgba(255, 248, 236, 0.22)' : 'rgba(22, 32, 51, 0.18)';
                    ctx.setLineDash([5, 6]);
                    ctx.beginPath();
                    ctx.moveTo(x + 33, y + 18);
                    ctx.lineTo(x + 33, y + height - 18);
                    ctx.moveTo(x + width - 33, y + 18);
                    ctx.lineTo(x + width - 33, y + height - 18);
                    ctx.stroke();
                } else if (layout === 'sparkle') {
                    const sparkleColor = dark ? 'rgba(255, 248, 236, 0.9)' : 'rgba(255, 255, 215, 0.95)';
                    const hotSpark = dark ? 'rgba(255, 210, 255, 0.78)' : 'rgba(255, 72, 156, 0.66)';
                    const blueSpark = dark ? 'rgba(160, 240, 255, 0.68)' : 'rgba(78, 196, 255, 0.52)';
                    [
                        [x + 46, y + 38, 9, sparkleColor],
                        [x + width - 82, y + 70, 12, hotSpark],
                        [x + 126, y + height - 44, 8, blueSpark],
                        [x + width - 126, y + height - 78, 11, sparkleColor],
                        [x + width * 0.52, y + 96, 10, hotSpark],
                        [x + 76, y + height - 104, 8, sparkleColor],
                        [x + width - 42, y + height - 42, 7, blueSpark],
                        [x + 212, y + height - 120, 7, hotSpark]
                    ].forEach(([sx, sy, size, color]) => this.drawFineSpark(ctx, sx, sy, size, color, 0.82));

                    ctx.strokeStyle = dark ? 'rgba(255, 248, 236, 0.18)' : 'rgba(255, 255, 255, 0.34)';
                    ctx.lineWidth = 2;
                    for (let stripe = -height; stripe < width; stripe += 42) {
                        ctx.beginPath();
                        ctx.moveTo(x + stripe, y + height);
                        ctx.lineTo(x + stripe + height * 0.78, y);
                        ctx.stroke();
                    }

                    for (let index = 0; index < 96; index++) {
                        const px = x + 26 + ((seed + index * 31) % (width - 52));
                        const py = y + 24 + ((seed * 3 + index * 47) % (height - 48));
                        ctx.save();
                        ctx.translate(px, py);
                        ctx.rotate((seed + index) * 0.17);
                        ctx.fillStyle = index % 5 === 0 ? blueSpark : index % 3 === 0 ? sparkleColor : hotSpark;
                        if (index % 4 === 0) {
                            ctx.fillRect(-4, -1.2, 8, 2.4);
                        } else {
                            ctx.beginPath();
                            ctx.arc(0, 0, index % 5 === 0 ? 3.1 : 1.9, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.restore();
                    }

                    const shine = ctx.createLinearGradient(x, y, x + width, y + height);
                    shine.addColorStop(0, 'rgba(255,255,255,0)');
                    shine.addColorStop(0.38, 'rgba(255,255,255,0.22)');
                    shine.addColorStop(0.5, 'rgba(255,255,255,0.04)');
                    shine.addColorStop(1, 'rgba(255,255,255,0)');
                    ctx.fillStyle = shine;
                    ctx.fillRect(x, y, width, height);
                } else {
                    ctx.strokeStyle = dark ? 'rgba(255, 248, 236, 0.16)' : 'rgba(22, 32, 51, 0.1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x + 28, y + height - 32);
                    ctx.quadraticCurveTo(x + width * 0.5, y + height - 18, x + width - 28, y + height - 34);
                    ctx.stroke();
                }

                ctx.restore();
            }

            drawTemplatePhotoOverlay(ctx, layout, width, height, theme, seed = 0, template = null) {
                ctx.save();
                ctx.beginPath();
                ctx.rect(0, 0, width, height);
                ctx.clip();

                if (layout === 'echo') {
                    ctx.globalCompositeOperation = 'screen';
                    ctx.fillStyle = rgbToCss(blendRgb(theme, { r: 25, g: 84, b: 255 }, 0.42), 0.24);
                    ctx.fillRect(0, 0, width, height);
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.fillStyle = 'rgba(68, 232, 255, 0.18)';
                    for (let yLine = 0; yLine < height; yLine += 6) ctx.fillRect(0, yLine, width, 1.5);
                    ctx.fillStyle = 'rgba(4, 20, 44, 0.14)';
                    for (let yLine = 3; yLine < height; yLine += 6) ctx.fillRect(0, yLine, width, 1);

                    ctx.globalCompositeOperation = 'screen';
                    ctx.fillStyle = 'rgba(95, 255, 246, 0.1)';
                    for (let xLine = 0; xLine < width; xLine += 22) ctx.fillRect(xLine, 0, 1, height);

                    const glitchRows = [
                        { y: 82 + (seed % 38), h: 8, dx: -18, color: 'rgba(74, 248, 255, 0.24)' },
                        { y: 204 + (seed % 31), h: 6, dx: 16, color: 'rgba(255, 72, 178, 0.15)' },
                        { y: 338 + (seed % 42), h: 8, dx: -10, color: 'rgba(108, 155, 255, 0.18)' }
                    ];
                    glitchRows.forEach((row) => {
                        ctx.fillStyle = row.color;
                        ctx.fillRect(Math.max(0, row.dx), row.y, width - Math.abs(row.dx), row.h);
                    });

                    ctx.strokeStyle = 'rgba(152, 252, 255, 0.22)';
                    ctx.lineWidth = 1.5;
                    [86, 136].forEach((radius) => {
                        ctx.beginPath();
                        ctx.arc(width * 0.78, height * 0.48, radius, -0.65, 0.74);
                        ctx.stroke();
                    });

                    ctx.globalCompositeOperation = 'source-over';

                    const frameX = 16;
                    const frameY = 14;
                    const frameW = width - 32;
                    const frameH = height - 28;
                    const titleH = 34;
                    const titleText = template && template.label ? template.label : 'EASON SIGNAL';
                    const statusText = template && template.corner ? template.corner : 'SIGNAL / ECHO';

                    ctx.shadowColor = 'rgba(0, 10, 28, 0.34)';
                    ctx.shadowBlur = 14;
                    ctx.shadowOffsetY = 5;
                    ctx.strokeStyle = 'rgba(2, 18, 40, 0.46)';
                    ctx.lineWidth = 8;
                    ctx.strokeRect(frameX + 4, frameY + 4, frameW - 8, frameH - 8);
                    ctx.shadowColor = 'transparent';

                    ctx.lineWidth = 4;
                    ctx.strokeStyle = 'rgba(176, 244, 255, 0.86)';
                    ctx.strokeRect(frameX, frameY, frameW, frameH);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = 'rgba(18, 100, 176, 0.82)';
                    ctx.strokeRect(frameX + 4, frameY + 4, frameW - 8, frameH - 8);
                    ctx.strokeStyle = 'rgba(4, 20, 45, 0.56)';
                    ctx.strokeRect(frameX + 8, frameY + 8, frameW - 16, frameH - 16);

                    const titleBar = ctx.createLinearGradient(frameX + 8, frameY + 8, frameX + frameW - 8, frameY + 8);
                    titleBar.addColorStop(0, 'rgba(8, 70, 150, 0.92)');
                    titleBar.addColorStop(0.55, 'rgba(17, 123, 218, 0.9)');
                    titleBar.addColorStop(1, 'rgba(4, 47, 112, 0.92)');
                    ctx.fillStyle = titleBar;
                    ctx.fillRect(frameX + 8, frameY + 8, frameW - 16, titleH);
                    ctx.strokeStyle = 'rgba(190, 255, 255, 0.55)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(frameX + 10, frameY + 10);
                    ctx.lineTo(frameX + frameW - 10, frameY + 10);
                    ctx.stroke();
                    ctx.strokeStyle = 'rgba(1, 19, 50, 0.72)';
                    ctx.beginPath();
                    ctx.moveTo(frameX + 10, frameY + titleH + 8);
                    ctx.lineTo(frameX + frameW - 10, frameY + titleH + 8);
                    ctx.stroke();

                    ctx.fillStyle = 'rgba(202, 255, 255, 0.95)';
                    ctx.font = '900 13px "Courier New", "PingFang SC", monospace';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`${titleText}.bmp`, frameX + 18, frameY + 25);
                    ctx.fillStyle = 'rgba(202, 255, 255, 0.72)';
                    ctx.font = '800 11px "Courier New", "PingFang SC", monospace';
                    ctx.fillText(statusText, frameX + 194, frameY + 25);

                    const buttonY = frameY + 15;
                    const buttons = [
                        { x: frameX + frameW - 86, type: 'min' },
                        { x: frameX + frameW - 60, type: 'max' },
                        { x: frameX + frameW - 34, type: 'close' }
                    ];
                    buttons.forEach((button) => {
                        ctx.fillStyle = button.type === 'close' ? 'rgba(143, 225, 246, 0.94)' : 'rgba(191, 238, 250, 0.94)';
                        ctx.fillRect(button.x, buttonY, 19, 18);
                        ctx.strokeStyle = 'rgba(244, 255, 255, 0.92)';
                        ctx.beginPath();
                        ctx.moveTo(button.x + 1, buttonY + 1);
                        ctx.lineTo(button.x + 18, buttonY + 1);
                        ctx.moveTo(button.x + 1, buttonY + 1);
                        ctx.lineTo(button.x + 1, buttonY + 17);
                        ctx.stroke();
                        ctx.strokeStyle = 'rgba(2, 26, 62, 0.72)';
                        ctx.beginPath();
                        ctx.moveTo(button.x + 18, buttonY + 1);
                        ctx.lineTo(button.x + 18, buttonY + 17);
                        ctx.lineTo(button.x + 1, buttonY + 17);
                        ctx.stroke();

                        ctx.strokeStyle = 'rgba(4, 33, 72, 0.92)';
                        ctx.lineWidth = 2;
                        if (button.type === 'min') {
                            ctx.beginPath();
                            ctx.moveTo(button.x + 5, buttonY + 12);
                            ctx.lineTo(button.x + 14, buttonY + 12);
                            ctx.stroke();
                        } else if (button.type === 'max') {
                            ctx.strokeRect(button.x + 5, buttonY + 5, 9, 8);
                        } else {
                            ctx.beginPath();
                            ctx.moveTo(button.x + 6, buttonY + 5);
                            ctx.lineTo(button.x + 13, buttonY + 12);
                            ctx.moveTo(button.x + 13, buttonY + 5);
                            ctx.lineTo(button.x + 6, buttonY + 12);
                            ctx.stroke();
                        }
                        ctx.lineWidth = 1;
                    });

                    ctx.strokeStyle = 'rgba(112, 235, 255, 0.22)';
                    ctx.lineWidth = 1;
                    for (let px = frameX + 20; px < frameX + frameW - 20; px += 18) {
                        ctx.beginPath();
                        ctx.moveTo(px, frameY + titleH + 12);
                        ctx.lineTo(px, frameY + frameH - 14);
                        ctx.stroke();
                    }
                } else if (layout === 'ticket') {
                    ctx.fillStyle = 'rgba(4, 5, 7, 0.34)';
                    ctx.fillRect(0, 0, 34, height);
                    ctx.fillRect(width - 34, 0, 34, height);
                    ctx.fillStyle = 'rgba(246, 235, 212, 0.6)';
                    for (let yDot = 34; yDot < height - 30; yDot += 42) {
                        ctx.beginPath();
                        ctx.arc(17, yDot, 7, 0, Math.PI * 2);
                        ctx.arc(width - 17, yDot, 7, 0, Math.PI * 2);
                        ctx.fill();
                    }
                } else if (layout === 'sparkle') {
                    ctx.globalCompositeOperation = 'screen';
                    const glow = ctx.createRadialGradient(width * 0.22, height * 0.28, 12, width * 0.22, height * 0.28, 150);
                    glow.addColorStop(0, 'rgba(255, 240, 180, 0.38)');
                    glow.addColorStop(1, 'rgba(255, 160, 210, 0)');
                    ctx.fillStyle = glow;
                    ctx.fillRect(0, 0, width, height);
                    ctx.globalCompositeOperation = 'source-over';
                    for (let index = 0; index < 22; index++) {
                        const px = 38 + ((seed + index * 43) % (width - 76));
                        const py = 38 + ((seed * 2 + index * 61) % (height - 76));
                        this.drawFineSpark(ctx, px, py, index % 3 === 0 ? 8 : 5, 'rgba(255, 246, 190, 0.72)', 0.54);
                    }
                }

                ctx.restore();
            }

            drawPostageStamp(ctx, x, y, width, height, rotation, theme, ink, label = 'POST') {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(rotation);
                ctx.fillStyle = 'rgba(246, 241, 230, 0.94)';
                ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetY = 4;
                ctx.fillRect(-width / 2, -height / 2, width, height);
                ctx.shadowColor = 'transparent';

                ctx.strokeStyle = rgbToCss(blendRgb(theme, { r: 31, g: 41, b: 55 }, 0.56), 0.76);
                ctx.lineWidth = 2;
                ctx.strokeRect(-width / 2 + 6, -height / 2 + 6, width - 12, height - 12);

                ctx.fillStyle = rgbToCss(blendRgb(theme, { r: 245, g: 240, b: 231 }, 0.5), 0.92);
                ctx.beginPath();
                ctx.ellipse(0, -4, width * 0.26, height * 0.24, -0.22, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = ink;
                ctx.globalAlpha = 0.52;
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(-width * 0.18, 6);
                ctx.quadraticCurveTo(-width * 0.02, -14, width * 0.18, 5);
                ctx.moveTo(-width * 0.2, 14);
                ctx.quadraticCurveTo(0, 2, width * 0.22, 14);
                ctx.stroke();
                ctx.globalAlpha = 1;

                ctx.fillStyle = ink;
                ctx.font = '700 10px "Times New Roman", serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(label, 0, height / 2 - 14);
                ctx.restore();
            }

            drawCardPhoto(ctx, image, x, y, width, height, radius, themeRgb = hexToRgb('#7fded8'), neonRgb = hexToRgb('#8dfff0')) {
                ctx.save();
                this.drawCanvasRoundedRect(ctx, x, y, width, height, radius);
                ctx.clip();

                const fallbackTop = blendRgb(themeRgb, { r: 237, g: 255, b: 250 }, 0.28);
                const fallbackBottom = blendRgb(themeRgb, { r: 2, g: 12, b: 24 }, 0.72);
                const photoFallback = ctx.createLinearGradient(x, y, x + width, y + height);
                photoFallback.addColorStop(0, rgbToCss(fallbackTop, 0.9));
                photoFallback.addColorStop(0.48, rgbToCss(themeRgb, 0.52));
                photoFallback.addColorStop(1, rgbToCss(fallbackBottom, 0.94));
                ctx.fillStyle = photoFallback;
                ctx.fillRect(x, y, width, height);

                if (image) {
                    this.drawImageCover(ctx, image, x, y, width, height);
                    ctx.globalCompositeOperation = 'multiply';
                    ctx.fillStyle = rgbToCss(themeRgb, 0.16);
                    ctx.fillRect(x, y, width, height);
                    ctx.globalCompositeOperation = 'screen';
                    ctx.fillStyle = rgbToCss(neonRgb, 0.18);
                    ctx.fillRect(x, y, width, height);
                    ctx.globalCompositeOperation = 'source-over';
                } else {
                    ctx.fillStyle = 'rgba(235, 255, 251, 0.72)';
                    ctx.font = '900 38px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('EASON', x + width / 2, y + height / 2 - 8);
                    ctx.font = '800 15px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                    ctx.fillText('PHOTO SIGNAL', x + width / 2, y + height / 2 + 30);
                }

                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = rgbToCss(neonRgb, 0.16);
                ctx.fillRect(x, y, width, height);
                ctx.globalCompositeOperation = 'source-over';

                ctx.fillStyle = 'rgba(195, 245, 255, 0.16)';
                for (let lineY = y; lineY < y + height; lineY += 7) {
                    ctx.fillRect(x, lineY, width, 1);
                }

                ctx.fillStyle = 'rgba(0, 9, 22, 0.18)';
                for (let lineY = y + 3; lineY < y + height; lineY += 7) {
                    ctx.fillRect(x, lineY, width, 1);
                }

                const gloss = ctx.createLinearGradient(x, y, x + width, y + height * 0.55);
                gloss.addColorStop(0, 'rgba(255,255,255,0.28)');
                gloss.addColorStop(0.32, 'rgba(255,255,255,0.04)');
                gloss.addColorStop(0.33, 'rgba(255,255,255,0)');
                gloss.addColorStop(1, 'rgba(255,255,255,0.1)');
                ctx.fillStyle = gloss;
                ctx.beginPath();
                ctx.moveTo(x + 16, y + 16);
                ctx.lineTo(x + width - 26, y + 16);
                ctx.lineTo(x + width * 0.62, y + 82);
                ctx.lineTo(x + 24, y + 118);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }

            drawFallbackWishCard() {
                const ctx = this.cardCtx;
                if (!ctx) return;
                ctx.clearRect(0, 0, this.cardCanvas.width, this.cardCanvas.height);
                const bg = ctx.createLinearGradient(0, 0, 512, 728);
                bg.addColorStop(0, '#d9f1f3');
                bg.addColorStop(1, '#74aabc');
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, 512, 728);
                ctx.fillStyle = '#082232';
                ctx.font = '900 34px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(WISH_COPY.fallbackCardTitle, 256, 360);
                if (this.cardTexture) this.cardTexture.needsUpdate = true;
            }

            drawBirthdayCardTexture(cardData, isSpecial) {
                const ctx = this.cardCtx;
                if (!ctx) return;

                const width = this.cardCanvas.width;
                const height = this.cardCanvas.height;
                const cardColor = isSpecial ? '#1a1a3e' : '#2a3a5c';
                const accentColor = isSpecial ? '#ffd700' : '#7fded8';
                const textColor = isSpecial ? '#fff8ec' : '#f0f4f8';
                const mutedColor = isSpecial ? 'rgba(255,248,236,0.6)' : 'rgba(200,215,230,0.7)';
                const borderColor = isSpecial ? 'rgba(255,215,0,0.6)' : 'rgba(127,222,216,0.5)';

                ctx.clearRect(0, 0, width, height);

                // Background gradient
                const bg = ctx.createLinearGradient(0, 0, width, height);
                if (isSpecial) {
                    bg.addColorStop(0, '#1a1a3e');
                    bg.addColorStop(0.5, '#2d1b4e');
                    bg.addColorStop(1, '#1a1a3e');
                } else {
                    bg.addColorStop(0, '#f5f0e7');
                    bg.addColorStop(0.3, '#e8e4d8');
                    bg.addColorStop(1, '#d4cfc2');
                }
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, width, height);

                // Paper grain
                this.drawPaperGrain(ctx, 0, 0, width, height, 42, isSpecial);

                // Top decorative stripe
                ctx.fillStyle = isSpecial ? 'rgba(255,215,0,0.15)' : 'rgba(127,222,216,0.12)';
                ctx.fillRect(0, 0, width, 140);

                // Header
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                // "EASON" title
                ctx.fillStyle = isSpecial ? '#ffd700' : accentColor;
                ctx.font = '900 52px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                ctx.shadowColor = isSpecial ? 'rgba(255,215,0,0.4)' : 'rgba(127,222,216,0.4)';
                ctx.shadowBlur = 16;
                ctx.fillText('EASON', width / 2, 62);
                ctx.shadowBlur = 0;

                // "BIRTHDAY CARD" subtitle
                ctx.fillStyle = mutedColor;
                ctx.font = '700 16px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                ctx.fillText('BIRTHDAY FORTUNE CARD', width / 2, 108);

                // Special badge
                if (isSpecial) {
                    ctx.fillStyle = '#ffd700';
                    ctx.font = '900 14px "Courier New", "PingFang SC", sans-serif';
                    ctx.shadowColor = 'rgba(255,215,0,0.6)';
                    ctx.shadowBlur = 10;
                    ctx.fillText(cardData.isFinal ? '★ FINAL CARD ★' : '★ HIDDEN CARD ★', width / 2, 136);
                    ctx.shadowBlur = 0;
                }

                // Draw number badge
                ctx.fillStyle = isSpecial ? 'rgba(255,215,0,0.8)' : mutedColor;
                ctx.font = '700 13px "Courier New", sans-serif';
                ctx.fillText(`NO.${String(cardData.drawNumber).padStart(2, '0')}`, width - 56, 34);

                ctx.restore();

                // Divider line
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(40, 156);
                ctx.lineTo(width - 40, 156);
                ctx.stroke();

                // Section 1: 今日适合听
                const sectionStartY = 184;
                ctx.fillStyle = isSpecial ? '#ffd700' : '#5a7a9a';
                ctx.font = '800 15px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('♪ 今日适合听', 44, sectionStartY);

                ctx.fillStyle = textColor;
                ctx.font = '900 26px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                ctx.textAlign = 'center';
                ctx.shadowColor = isSpecial ? 'rgba(255,215,0,0.3)' : 'rgba(127,222,216,0.3)';
                ctx.shadowBlur = 8;
                ctx.fillText(`《${cardData.song}》`, width / 2, sectionStartY + 42);
                ctx.shadowBlur = 0;

                // Divider
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(60, sectionStartY + 68);
                ctx.lineTo(width - 60, sectionStartY + 68);
                ctx.stroke();

                // Section 2: 今日情绪签
                const section2Y = sectionStartY + 90;
                ctx.fillStyle = isSpecial ? '#ffd700' : '#5a7a9a';
                ctx.font = '800 15px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('◆ 今日情绪签', 44, section2Y);

                ctx.fillStyle = textColor;
                ctx.font = '700 18px "Songti SC", "STSong", "Noto Serif CJK SC", "PingFang SC", serif';
                ctx.textAlign = 'left';
                const emotionLines = this.wrapText(ctx, cardData.emotion, width - 88);
                emotionLines.forEach((line, i) => {
                    ctx.fillText(line, 52, section2Y + 34 + i * 28);
                });

                // Divider
                ctx.strokeStyle = borderColor;
                ctx.beginPath();
                ctx.moveTo(60, section2Y + 34 + emotionLines.length * 28 + 12);
                ctx.lineTo(width - 60, section2Y + 34 + emotionLines.length * 28 + 12);
                ctx.stroke();

                // Section 3: 生日小纸条
                const section3Y = section2Y + 34 + emotionLines.length * 28 + 34;

                // Paper slip background
                ctx.fillStyle = isSpecial ? 'rgba(255,215,0,0.06)' : 'rgba(127,222,216,0.06)';
                this.drawCanvasRoundedRect(ctx, 36, section3Y - 8, width - 72, 160, 10);
                ctx.fill();

                ctx.fillStyle = isSpecial ? '#ffd700' : '#5a7a9a';
                ctx.font = '800 15px "Courier New", "PingFang SC", "Microsoft YaHei", sans-serif';
                ctx.textAlign = 'left';
                ctx.fillText('💌 生日小纸条', 44, section3Y + 12);

                ctx.fillStyle = textColor;
                ctx.font = '700 18px "Songti SC", "STSong", "Noto Serif CJK SC", "PingFang SC", serif';
                ctx.textAlign = 'left';
                const noteLines = this.wrapText(ctx, cardData.note, width - 100);
                noteLines.forEach((line, i) => {
                    ctx.fillText(line, 52, section3Y + 46 + i * 28);
                });

                // Decorative sparkles
                if (isSpecial) {
                    for (let i = 0; i < 12; i++) {
                        const sx = 40 + ((i * 47 + 23) % (width - 80));
                        const sy = 160 + ((i * 61 + 17) % 480);
                        this.drawFineSpark(ctx, sx, sy, 5 + (i % 3) * 3, 'rgba(255,215,0,0.5)', 0.5);
                    }
                } else {
                    for (let i = 0; i < 8; i++) {
                        const sx = 40 + ((i * 53 + 31) % (width - 80));
                        const sy = 160 + ((i * 67 + 11) % 480);
                        this.drawFineSpark(ctx, sx, sy, 4 + (i % 3) * 2, 'rgba(127,222,216,0.4)', 0.4);
                    }
                }

                // Border
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(18, 18, width - 36, height - 36);

                // Inner border
                ctx.strokeStyle = isSpecial ? 'rgba(255,215,0,0.2)' : 'rgba(127,222,216,0.2)';
                ctx.lineWidth = 1;
                ctx.strokeRect(24, 24, width - 48, height - 48);

                if (this.cardTexture) this.cardTexture.needsUpdate = true;
            }

            wrapText(ctx, text, maxWidth) {
                const source = String(text || '').trim();
                if (!source) return [''];
                const chars = Array.from(source);
                const lines = [];
                let current = '';
                chars.forEach((char) => {
                    const next = current + char;
                    if (ctx.measureText(next).width > maxWidth && current) {
                        lines.push(current);
                        current = char;
                    } else {
                        current = next;
                    }
                });
                if (current) lines.push(current);
                return lines.length ? lines : [''];
            }

            drawWishCardTexture(form, assets) {
                const ctx = this.cardCtx;
                if (!ctx) return;

                const width = this.cardCanvas.width;
                const height = this.cardCanvas.height;
                const template = assets.template || resolveWishCardTemplate(form);
                const layout = template.layout || 'letter';
                const theme = hexToRgb(form.themeColor);
                const seed = hashWishText(`${form.lyric}|${form.memo}|${form.easonStyle}|${form.cardStyle}`);
                const panelPaperTarget = layout === 'ticket'
                    ? { r: 242, g: 232, b: 214 }
                    : layout === 'sparkle'
                        ? { r: 255, g: 205, b: 232 }
                        : layout === 'echo'
                            ? { r: 3, g: 21, b: 48 }
                            : { r: 246, g: 241, b: 230 };
                const panelBlend = layout === 'echo' ? 0.82 : layout === 'ticket' ? 0.34 : layout === 'sparkle' ? 0.54 : 0.24;
                const panelColor = blendRgb(theme, panelPaperTarget, panelBlend);
                const luminance = panelColor.r * 0.299 + panelColor.g * 0.587 + panelColor.b * 0.114;
                const isDarkPanel = luminance < 132;
                const ink = layout === 'echo'
                    ? '#c8fbff'
                    : isDarkPanel ? '#fff8ec' : '#162033';
                const quietInk = layout === 'echo'
                    ? 'rgba(180, 247, 255, 0.76)'
                    : isDarkPanel ? 'rgba(255, 248, 236, 0.72)' : 'rgba(22, 32, 51, 0.64)';
                const poemInk = layout === 'echo'
                    ? 'rgba(188, 252, 255, 0.9)'
                    : isDarkPanel ? 'rgba(255, 248, 236, 0.9)' : 'rgba(22, 32, 51, 0.82)';
                const paper = '#f5f0e7';
                const photoHeight = 486;
                const panelY = photoHeight;
                const panelHeight = height - panelY;
                const poemLines = resolvePoeticMemoLines(form, template);
                const lyric = form.lyric || template.fallbackLyric || WISH_COPY.defaultLyric;

                ctx.clearRect(0, 0, width, height);

                ctx.fillStyle = paper;
                ctx.fillRect(0, 0, width, height);
                this.drawPaperGrain(ctx, 0, 0, width, height, seed, false);

                ctx.save();
                if (assets.photoImage) {
                    this.drawImageCover(ctx, assets.photoImage, 0, 0, width, photoHeight + 6);
                    ctx.globalCompositeOperation = 'screen';
                    ctx.fillStyle = 'rgba(255, 244, 222, 0.1)';
                    ctx.fillRect(0, 0, width, photoHeight + 6);
                    ctx.globalCompositeOperation = 'source-over';
                } else {
                    const fallback = ctx.createLinearGradient(0, 0, width, photoHeight);
                    fallback.addColorStop(0, rgbToCss(blendRgb(theme, { r: 255, g: 255, b: 255 }, 0.38), 1));
                    fallback.addColorStop(1, rgbToCss(blendRgb(theme, { r: 20, g: 24, b: 32 }, 0.56), 1));
                    ctx.fillStyle = fallback;
                    ctx.fillRect(0, 0, width, photoHeight + 6);
                    ctx.fillStyle = isDarkPanel ? 'rgba(255,250,240,0.78)' : 'rgba(17,24,39,0.72)';
                    ctx.font = '700 30px "Times New Roman", "Songti SC", serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(WISH_COPY.fallbackPhotoText, width / 2, photoHeight / 2);
                }
                ctx.restore();
                this.drawTemplatePhotoOverlay(ctx, layout, width, photoHeight + 6, theme, seed, template);

                ctx.fillStyle = rgbToCss(panelColor, 1);
                ctx.fillRect(0, panelY, width, panelHeight);
                this.drawPaperGrain(ctx, 0, panelY, width, panelHeight, seed + 17, isDarkPanel);
                this.drawTemplatePanelPattern(ctx, layout, 0, panelY, width, panelHeight, theme, ink, isDarkPanel, seed);

                ctx.fillStyle = paper;
                ctx.fillRect(0, panelY - 4, width, 8);

                const slipStyle = {
                    letter: {
                        fill: 'rgba(247, 243, 233, 0.94)',
                        color: '#151515',
                        stroke: 'rgba(31, 41, 55, 0.18)',
                        font: '700 14px "Times New Roman", "Songti SC", serif'
                    },
                    echo: {
                        fill: 'rgba(11, 29, 58, 0.86)',
                        color: '#b8f7ff',
                        stroke: 'rgba(116, 226, 255, 0.38)',
                        font: '800 13px "Courier New", "PingFang SC", monospace'
                    },
                    ticket: {
                        fill: 'rgba(252, 230, 178, 0.94)',
                        color: '#1d1b15',
                        stroke: 'rgba(28, 24, 18, 0.36)',
                        font: '900 13px "Arial Black", "PingFang SC", sans-serif'
                    },
                    sparkle: {
                        fill: 'rgba(255, 245, 92, 0.98)',
                        color: '#7a174c',
                        stroke: 'rgba(255, 70, 158, 0.66)',
                        font: '900 14px "Arial Rounded MT Bold", "PingFang SC", sans-serif'
                    }
                }[layout] || {
                    fill: 'rgba(247, 243, 233, 0.94)',
                    color: '#151515',
                    stroke: 'rgba(31, 41, 55, 0.18)',
                    font: '700 14px "Times New Roman", "Songti SC", serif'
                };

                if (layout !== 'echo') {
                    this.drawPaperSlip(ctx, 100, 44, 154, 34, template.label, -0.02, {
                        fill: slipStyle.fill,
                        color: slipStyle.color,
                        stroke: slipStyle.stroke,
                        font: slipStyle.font
                    });
                    this.drawPaperSlip(ctx, width - 88, 46, 132, 32, template.corner, -0.08, {
                        fill: slipStyle.fill,
                        color: slipStyle.color,
                        stroke: slipStyle.stroke,
                        font: slipStyle.font
                    });
                }

                (template.paperTags || []).forEach((tag, index) => {
                    this.drawPaperSlip(ctx, tag.x, tag.y, tag.width, 26, tag.text, tag.angle, {
                        fill: layout === 'sparkle'
                            ? (index === 0 ? 'rgba(255, 245, 92, 0.98)' : 'rgba(255, 121, 184, 0.92)')
                            : (index === 0 ? slipStyle.fill : 'rgba(244, 239, 228, 0.88)'),
                        color: slipStyle.color,
                        stroke: slipStyle.stroke,
                        font: layout === 'letter'
                            ? '700 12px "Times New Roman", "Songti SC", serif'
                            : '800 12px "Courier New", "PingFang SC", sans-serif'
                    });
                });

                this.drawFineSpark(ctx, 66, 122, 9, 'rgba(246, 241, 230, 0.76)', 0.68);

                ctx.fillStyle = ink;
                ctx.font = layout === 'echo'
                    ? '800 16px "Courier New", "PingFang SC", monospace'
                    : '700 16px "Times New Roman", "Songti SC", serif';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                if (layout === 'echo') {
                    ctx.shadowColor = 'rgba(90, 248, 255, 0.5)';
                    ctx.shadowBlur = 8;
                }
                ctx.fillText(template.kicker, layout === 'echo' ? 44 : 40, panelY + 34);
                ctx.shadowBlur = 0;

                const lyricConfig = {
                    letter: { x: 40, y: panelY + 68, size: 29, lineHeight: 38, maxWidth: width - 78, weight: 700, family: '"Songti SC", "STSong", "Noto Serif CJK SC", serif' },
                    echo: { x: 44, y: panelY + 62, size: 24, lineHeight: 31, maxWidth: 262, weight: 800, family: '"Courier New", "PingFang SC", "Microsoft YaHei", monospace' },
                    ticket: { x: 46, y: panelY + 60, size: 26, lineHeight: 34, maxWidth: width - 110, weight: 800, family: '"Impact", "Arial Black", "PingFang SC", sans-serif' },
                    sparkle: { x: 40, y: panelY + 64, size: 30, lineHeight: 37, maxWidth: width - 96, weight: 900, family: '"Arial Rounded MT Bold", "PingFang SC", "Microsoft YaHei", sans-serif' }
                }[layout] || { x: 40, y: panelY + 68, size: 29, lineHeight: 38, maxWidth: width - 78, weight: 700, family: '"Songti SC", "STSong", "Noto Serif CJK SC", serif' };

                ctx.font = `${lyricConfig.weight} ${lyricConfig.size}px ${lyricConfig.family}`;
                const lyricLines = splitCardText(ctx, `“${lyric}”`, lyricConfig.maxWidth, 4);
                if (layout === 'echo') {
                    ctx.shadowColor = 'rgba(90, 248, 255, 0.64)';
                    ctx.shadowBlur = 8;
                }
                this.drawCardTextLines(ctx, lyricLines, lyricConfig.x, lyricConfig.y, lyricConfig.lineHeight);
                ctx.shadowBlur = 0;

                (assets.decorImages || []).forEach((item, index) => {
                    const placement = (template.decorPlacements || [])[index];
                    if (!placement) return;
                    this.drawDecorImage(ctx, item.image || item, placement.x, placement.y, placement.size, placement.angle, placement.alpha);
                });

                if (assets.stickerImage) {
                    this.drawDecorSticker(ctx, assets.stickerImage, width - 88, panelY + 142, 108, 0.08, 0.88);
                } else {
                    this.drawPostageStamp(ctx, width - 88, panelY + 142, 76, 60, -0.08, panelColor, ink, template.stampText);
                }

                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                const poemLayout = ({
                    letter: [
                        { x: 42, y: panelY + 142, size: 16, alpha: 1, weight: 700 },
                        { x: 60, y: panelY + 165, size: 15, alpha: 0.92, weight: 650 },
                        { x: 42, y: panelY + 187, size: 15, alpha: 0.86, weight: 650 },
                        { x: 60, y: panelY + 208, size: 14, alpha: 0.8, weight: 620 }
                    ],
                    echo: [
                        { x: 44, y: panelY + 136, size: 14, alpha: 0.94, weight: 700 },
                        { x: 64, y: panelY + 156, size: 14, alpha: 0.88, weight: 660 },
                        { x: 44, y: panelY + 176, size: 13.5, alpha: 0.82, weight: 640 },
                        { x: 64, y: panelY + 195, size: 13.5, alpha: 0.76, weight: 640 }
                    ],
                    ticket: [
                        { x: 48, y: panelY + 138, size: 15, alpha: 0.94, weight: 700 },
                        { x: 48, y: panelY + 161, size: 15, alpha: 0.86, weight: 650 },
                        { x: 68, y: panelY + 184, size: 14, alpha: 0.8, weight: 620 },
                        { x: 48, y: panelY + 205, size: 14, alpha: 0.74, weight: 620 }
                    ],
                    sparkle: [
                        { x: 42, y: panelY + 140, size: 16, alpha: 0.96, weight: 700 },
                        { x: 68, y: panelY + 164, size: 15, alpha: 0.9, weight: 650 },
                        { x: 48, y: panelY + 187, size: 15, alpha: 0.84, weight: 650 },
                        { x: 78, y: panelY + 209, size: 14, alpha: 0.78, weight: 620 }
                    ]
                }[layout] || []).map((settings, index) => Object.assign({}, settings, {
                    text: poemLines[index] || ''
                }));

                poemLayout.filter((line) => line.text).forEach((line) => {
                    ctx.save();
                    ctx.globalAlpha = line.alpha;
                    ctx.fillStyle = poemInk;
                    const poemFamily = layout === 'echo'
                        ? '"Courier New", "PingFang SC", monospace'
                        : layout === 'ticket'
                            ? '"Arial Black", "PingFang SC", sans-serif'
                            : layout === 'sparkle'
                                ? '"Arial Rounded MT Bold", "PingFang SC", sans-serif'
                                : '"Songti SC", "STSong", "Noto Serif CJK SC", serif';
                    ctx.font = `${line.weight} ${line.size}px ${poemFamily}`;
                    if (layout === 'echo') {
                        ctx.shadowColor = 'rgba(90, 248, 255, 0.34)';
                        ctx.shadowBlur = 7;
                    }
                    ctx.fillText(line.text, line.x, line.y);
                    ctx.restore();
                });

                ctx.fillStyle = ink;
                ctx.textAlign = 'right';
                ctx.font = layout === 'echo'
                    ? '800 13px "Courier New", "PingFang SC", monospace'
                    : '700 13px "Times New Roman", "Songti SC", serif';
                ctx.fillText(template.footer, width - 38, height - 38);

                ctx.strokeStyle = isDarkPanel ? 'rgba(255,250,240,0.38)' : 'rgba(17,24,39,0.28)';
                ctx.lineWidth = 2;
                ctx.strokeRect(18, 18, width - 36, height - 36);

                if (this.cardTexture) this.cardTexture.needsUpdate = true;
            }

            async renderWishCardTexture(form = {}) {
                // 生日签模式：直接绘制生日卡片
                if (form.birthdayCard) {
                    this.drawBirthdayCardTexture(form.birthdayCard, form.isSpecial || false);
                    return { template: null, cardIndex: 0, birthdayCard: true };
                }

                // 原有许愿模式保留
                const template = resolveWishCardTemplate(form);
                const cardIndex = pickWishCardIndex(form);
                const seed = hashWishText(`${form.lyric}|${form.memo}|${form.themeColor}|${form.cardStyle}|${cardIndex}`);

                const photoSources = [
                    WISH_PHOTOS[cardIndex],
                    ...WISH_PHOTOS.filter((_, index) => index !== cardIndex)
                ];
                const decorSources = template.decorSources || pickDecorStickerSources(form, seed).slice(0, 2);
                const results = await Promise.allSettled([
                    this.loadFirstAvailableAsset(photoSources),
                    this.loadCardAsset(WISH_STICKERS[cardIndex]),
                    ...decorSources.slice(0, 2).map(source => this.loadCardAsset(source))
                ]);

                const assets = {
                    template,
                    cardIndex,
                    photoImage: results[0].status === 'fulfilled' ? results[0].value : null,
                    stickerImage: results[1].status === 'fulfilled' ? results[1].value : null,
                    decorImages: results.slice(2)
                        .map((result, index) => result.status === 'fulfilled'
                            ? { image: result.value, source: decorSources[index] }
                            : null)
                        .filter(Boolean)
                };

                this.drawWishCardTexture(form, assets);
                return assets;
            }

            setupLighting() {
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
                this.scene.add(ambientLight);

                const dirLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
                dirLight.position.set(-5, 10, 8);
                dirLight.castShadow = true;
                dirLight.shadow.mapSize.width = 2048;
                dirLight.shadow.mapSize.height = 2048;
                dirLight.shadow.bias = -0.001;
                this.scene.add(dirLight);

                const fillLight = new THREE.DirectionalLight(0xddeeff, 1.5);
                fillLight.position.set(8, 2, 0);
                this.scene.add(fillLight);

                const frontLight = new THREE.PointLight(0xffffff, 1.0, 20);
                frontLight.position.set(0, 2, 6);
                this.scene.add(frontLight);
            }

            bindEvents() {
                window.addEventListener('resize', this.handleResize);
                window.addEventListener('pointerdown', this.handlePointerDown);
                window.addEventListener('pointermove', this.handlePointerMove);
                window.addEventListener('pointerup', this.handlePointerUp);
                window.addEventListener('pointercancel', this.handlePointerUp);
            }

            unbindEvents() {
                window.removeEventListener('resize', this.handleResize);
                window.removeEventListener('pointerdown', this.handlePointerDown);
                window.removeEventListener('pointermove', this.handlePointerMove);
                window.removeEventListener('pointerup', this.handlePointerUp);
                window.removeEventListener('pointercancel', this.handlePointerUp);
                if (this.controls) {
                    this.controls.dispose();
                    this.controls = null;
                }
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            }

            handleResize() {
                if (!this.camera || !this.renderer) return;
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }

            setRaycastMouse(e) {
                this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
                this.raycaster.setFromCamera(this.mouse, this.camera);
            }

            handlePointerDown(e) {
                if (e.button !== 0) return;
                if (this.renderer && e.target !== this.renderer.domElement) return;

                this.setRaycastMouse(e);
                const wishButtonIntersects = this.wishButtonGroup
                    ? this.raycaster.intersectObject(this.wishButtonGroup, true)
                    : [];

                if (wishButtonIntersects.length > 0 && !this.awaitingWishKnob) {
                    this.playWishButtonPress();
                    this.onWishButtonClick();
                    return;
                }

                const intersects = this.raycaster.intersectObject(this.knob, true);

                if (intersects.length > 0 && this.awaitingWishKnob && this.pendingWishForm && !this.isAnimating) {
                    this.isKnobDragging = true;
                    this.knobDragTotal = 0;
                    this.knobLastX = e.clientX;
                    this.knobLastY = e.clientY;
                    if (this.controls) this.controls.enabled = false;
                    e.preventDefault();
                    return;
                }

                if (intersects.length > 0 && !this.isAnimating) {
                    this.playGachaAnimation();
                }
            }

            handlePointerMove(e) {
                if (!this.isKnobDragging || !this.knob || !this.awaitingWishKnob) return;

                const dx = e.clientX - this.knobLastX;
                const dy = e.clientY - this.knobLastY;
                this.knobLastX = e.clientX;
                this.knobLastY = e.clientY;
                this.knobDragTotal += Math.abs(dx) + Math.abs(dy);
                this.knob.rotation.x += dx * 0.024 + dy * 0.012;

                if (this.knobDragTotal > 92) {
                    this.releasePendingWishCard();
                }
                e.preventDefault();
            }

            handlePointerUp() {
                if (!this.isKnobDragging) return;
                const shouldRelease = this.knobDragTotal > 46;
                this.isKnobDragging = false;
                if (this.controls) this.controls.enabled = true;

                if (shouldRelease) {
                    this.releasePendingWishCard();
                } else if (this.knob) {
                    gsap.to(this.knob.rotation, {
                        x: Math.round(this.knob.rotation.x / (Math.PI / 4)) * (Math.PI / 4),
                        duration: 0.22,
                        ease: "power2.out"
                    });
                }
            }

            playWishButtonPress() {
                if (!this.wishButtonGroup) return;

                gsap.killTweensOf(this.wishButtonGroup.position);
                gsap.to(this.wishButtonGroup.position, {
                    z: "-=0.08",
                    duration: 0.08,
                    ease: "power1.in",
                    yoyo: true,
                    repeat: 1
                });
            }

            getWishInsertScreenPoint() {
                if (!this.wishInsertSlot || !this.camera || !this.renderer) return null;

                this.scene.updateMatrixWorld(true);
                const worldPoint = this.wishInsertSlot.localToWorld(new THREE.Vector3(0, 0, 0.12));
                const projected = worldPoint.project(this.camera);

                if (!Number.isFinite(projected.x) || !Number.isFinite(projected.y) || projected.z < -1 || projected.z > 1) {
                    return null;
                }

                const rect = this.renderer.domElement.getBoundingClientRect();
                return {
                    x: rect.left + (projected.x + 1) * rect.width / 2,
                    y: rect.top + (1 - projected.y) * rect.height / 2
                };
            }

            getKnobScreenPoint() {
                if (!this.knob || !this.camera || !this.renderer) return null;

                this.scene.updateMatrixWorld(true);
                const worldPoint = this.knob.localToWorld(new THREE.Vector3(0, 0.62, 0.08));
                const projected = worldPoint.project(this.camera);

                if (!Number.isFinite(projected.x) || !Number.isFinite(projected.y) || projected.z < -1 || projected.z > 1) {
                    return null;
                }

                const rect = this.renderer.domElement.getBoundingClientRect();
                return {
                    x: rect.left + (projected.x + 1) * rect.width / 2,
                    y: rect.top + (1 - projected.y) * rect.height / 2
                };
            }

            resetCardPose() {
                if (!this.card) return;
                gsap.killTweensOf(this.card.position);
                gsap.killTweensOf(this.card.rotation);
                this.card.position.set(0, this.cardSlotY, 1.0);
                this.card.rotation.set(-Math.PI / 2 + 0.1, 0, 0);
                this.card.visible = true;
            }

            playCardDispenseAnimation({ hold = 5600, delay = 0.18, shake = true } = {}) {
                if (!this.card) return;
                this.isAnimating = true;
                this.resetCardPose();

                if (shake) {
                    gsap.to(this.machineGroup.position, {
                        y: "+=0.055",
                        yoyo: true,
                        repeat: 7,
                        duration: 0.07,
                        ease: "sine.inOut"
                    });
                }

                const tl = gsap.timeline({
                    onComplete: () => {
                        window.setTimeout(() => {
                            gsap.to(this.card.position, {
                                z: 1.0,
                                y: this.cardSlotY + 0.03,
                                duration: 0.48,
                                ease: "power1.in",
                                onComplete: () => {
                                    this.card.visible = false;
                                    this.isAnimating = false;
                                }
                            });
                            gsap.to(this.card.rotation, {
                                x: -Math.PI / 2 + 0.08,
                                z: 0,
                                duration: 0.42,
                                ease: "power1.in"
                            });
                        }, hold);
                    }
                });

                tl.to(this.card.position, {
                    z: 3.28,
                    y: this.cardSlotY - 0.16,
                    duration: 0.72,
                    delay,
                    ease: "back.out(1.15)"
                }, 0)
                .to(this.card.rotation, {
                    x: -0.08,
                    y: 0,
                    z: -0.035,
                    duration: 0.72,
                    delay,
                    ease: "power2.out"
                }, 0)
                .to(this.card.position, {
                    z: 3.62,
                    y: this.cardSlotY - 0.52,
                    duration: 0.46,
                    ease: "power2.out"
                }, ">")
                .to(this.card.rotation, {
                    x: 0.03,
                    z: 0.035,
                    duration: 0.46,
                    ease: "power2.out"
                }, "<");
            }

            prepareWishCard(form) {
                const requestId = (this.pendingWishRequestId || 0) + 1;
                this.pendingWishRequestId = requestId;
                this.pendingWishForm = form;
                this.pendingWishReady = false;
                this.awaitingWishKnob = false;
                this.setKnobGuidanceVisible(false);
                this.onKnobAwaitingChange(false, null);

                if (this.card) {
                    this.card.visible = false;
                }

                return this.renderWishCardTexture(form)
                    .catch(() => {
                        this.drawFallbackWishCard();
                    })
                    .then(() => {
                        if (this.pendingWishRequestId !== requestId) return;
                        this.pendingWishReady = true;
                        this.awaitingWishKnob = true;
                        this.setKnobGuidanceVisible(true);
                        this.onKnobAwaitingChange(true, this.getKnobScreenPoint());
                    });
            }

            releasePendingWishCard() {
                if (!this.awaitingWishKnob || !this.pendingWishForm || !this.pendingWishReady || this.isAnimating) return;

                const form = this.pendingWishForm;
                const requestId = this.pendingWishRequestId;
                this.awaitingWishKnob = false;
                this.pendingWishReady = false;
                this.pendingWishForm = null;
                this.isKnobDragging = false;
                if (this.controls) this.controls.enabled = true;
                this.setKnobGuidanceVisible(false);
                this.onKnobAwaitingChange(false, null);

                gsap.to(this.knob.rotation, {
                    x: this.knob.rotation.x + Math.PI * 2,
                    duration: 0.78,
                    ease: "power2.inOut"
                });

                this.playCardDispenseAnimation({ hold: 7200, delay: 0.18 });
                window.setTimeout(() => {
                    if (this.pendingWishRequestId !== requestId || !this.cardCanvas) return;
                    this.onWishCardExpanded(this.cardCanvas.toDataURL('image/png'), form);
                }, 1800);
            }

            dispenseWishCard(form) {
                this.prepareWishCard(form).then(() => this.releasePendingWishCard());
            }

            playGachaAnimation() {
                this.isAnimating = true;

                gsap.to(this.knob.rotation, {
                    x: this.knob.rotation.x + Math.PI * 2,
                    duration: 0.8,
                    ease: "power2.inOut"
                });

                gsap.to(this.machineGroup.position, {
                    y: "+=0.05",
                    yoyo: true,
                    repeat: 5,
                    duration: 0.08,
                    ease: "sine.inOut"
                });

                this.playCardDispenseAnimation({ hold: 2500, delay: 0.4, shake: false });
            }

            animateLoop() {
                this.animationId = requestAnimationFrame(this.animateLoop);

                if (this.controls) {
                    this.controls.update();
                }

                if (this.updateSignText) {
                    this.updateSignText();
                }

                if (this.updateScreenCarousel) {
                    this.updateScreenCarousel(performance.now());
                }

                if (this.updateWishButtonTexture) {
                    this.updateWishButtonTexture();
                }

                if (this.knobSurfaceArrow && this.knobSurfaceArrow.visible && this.knobArrowMaterial) {
                    const pulse = Math.sin(performance.now() * 0.006) * 0.5 + 0.5;
                    const scale = 0.96 + pulse * 0.05;
                    this.knobArrowMaterial.opacity = 0.74 + pulse * 0.22;
                    this.knobSurfaceArrow.scale.set(scale, scale, scale);
                }

                if (this.renderer && this.scene && this.camera) {
                    this.renderer.render(this.scene, this.camera);
                }
            }
        }

        const App = () => {
            const containerRef = useRef(null);
            const machineRef = useRef(null);
            const [lyricLines, setLyricLines] = useState(LYRIC_LINES);
            const [expandedCard, setExpandedCard] = useState(null);
            const [isDrawing, setIsDrawing] = useState(false);
            const [drawCount, setDrawCount] = useState(getDrawCount);

            useEffect(() => {
                if (!containerRef.current) return;

                if (!machineRef.current) {
                    machineRef.current = new GachaMachine3D(containerRef.current, {
                        onWishButtonClick: () => handleDrawCard(),
                        onWishCardExpanded: (imageDataUrl, form) => {
                            setExpandedCard({
                                imageDataUrl,
                                downloadUrl: createCardDownloadUrl(imageDataUrl),
                                themeColor: form && form.isSpecial ? '#ffd700' : '#7fded8',
                                filename: `${WISH_COPY.downloadPrefix}-${Date.now()}.png`
                            });
                        },
                        onKnobAwaitingChange: () => {}
                    });
                }

                return () => {
                    if (machineRef.current) {
                        machineRef.current.unbindEvents();
                        if (machineRef.current.renderer) {
                            machineRef.current.renderer.dispose();
                        }
                        machineRef.current = null;
                    }
                    if (containerRef.current) {
                         containerRef.current.innerHTML = '';
                    }
                };
            }, []);

            useEffect(() => {
                if (Array.isArray(DRAW_CARD_CONFIG.lyrics) && DRAW_CARD_CONFIG.lyrics.length) return;
                fetch(DRAW_CARD_CONFIG.lyricsPath || 'lyrics.txt')
                    .then(response => response.ok ? response.text() : '')
                    .then(text => {
                        const loadedLines = text
                            .split(/\r?\n/)
                            .map(line => line.replace(/^\s*\d+）\s*/, '').trim())
                            .filter(Boolean);
                        if (loadedLines.length) {
                            setLyricLines(loadedLines);
                        }
                    })
                    .catch(() => {});
            }, []);

            useEffect(() => {
                return () => {
                    if (expandedCard && expandedCard.downloadUrl) {
                        revokeCardDownloadUrl(expandedCard.downloadUrl);
                    }
                };
            }, [expandedCard]);

            const handleDrawCard = () => {
                if (isDrawing) return;
                setIsDrawing(true);

                const cardData = pickBirthdayCard();
                setDrawCount(cardData.drawNumber);

                const form = {
                    birthdayCard: cardData,
                    isSpecial: cardData.isSpecial || false,
                    themeColor: cardData.isSpecial ? '#ffd700' : '#7fded8'
                };

                if (machineRef.current && machineRef.current.dispenseWishCard) {
                    machineRef.current.dispenseWishCard(form);
                }

                window.setTimeout(() => setIsDrawing(false), 3000);
            };

            const closeExpandedCard = () => {
                setExpandedCard(null);
            };

            const lyricItems = [...lyricLines, ...lyricLines];

            return (
                <div className="relative w-full h-full">
                    <div id="gradient-bg">
                        <div className="lyrics-layer" aria-hidden="true">
                            {lyricItems.map((line, index) => {
                                const left = ((index * 31) % 118) - 12;
                                const duration = 23 + (index % 7) * 1.7;
                                const delay = index * -1.45;
                                const size = 4.1 + (index % 5) * 0.55;
                                const desktopSize = (size * 0.8).toFixed(2);
                                const depth = [-140, -70, 0, 72, 128, -104, 44][index % 7];
                                const depthScale = (1 + depth / 1700).toFixed(3);
                                const tiltX = (depth / 54).toFixed(2);
                                const depthBlur = depth < 0 ? '0.55px' : '0.08px';
                                const colorDuration = 6.5 + (index % 5) * 0.7;
                                const colorDelay = index * -0.55;
                                return (
                                    <span
                                        key={`${line}-${index}`}
                                        className="lyric-line"
                                        style={{
                                            left: `${left}%`,
                                            animationDelay: `${delay}s, ${colorDelay}s`,
                                            animationDuration: `${duration}s, ${colorDuration}s`,
                                            '--lyric-size': `${size}vw`,
                                            '--lyric-size-desktop': `${desktopSize}vw`,
                                            '--lyric-z': `${depth}px`,
                                            '--lyric-depth-scale': depthScale,
                                            '--lyric-tilt-x': `${tiltX}deg`,
                                            '--lyric-depth-blur': depthBlur
                                        }}
                                    >
                                        {line}
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    <div ref={containerRef} id="canvas-container"></div>
                    <div className="scanlines"></div>

                    {/* Draw count display */}
                    <div style={{
                        position: 'fixed',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: '15',
                        pointerEvents: 'none',
                        fontFamily: '"Courier New", "PingFang SC", monospace',
                        fontSize: '13px',
                        color: 'rgba(160, 220, 230, 0.55)',
                        letterSpacing: '1.5px',
                        textShadow: '0 0 8px rgba(127, 222, 216, 0.3)'
                    }}>
                        已抽 {drawCount} / 12
                    </div>

                    {expandedCard && (
                        <div
                            className="result-card-overlay"
                            style={{ '--result-card-color': expandedCard.themeColor }}
                            onClick={closeExpandedCard}
                        >
                            <div className="result-card-stack" onClick={(event) => event.stopPropagation()}>
                                <div className="result-card-shell">
                                    <button className="result-card-close" type="button" onClick={closeExpandedCard} aria-label={WISH_COPY.closeLabel}>×</button>
                                    <img className="result-card-preview" src={expandedCard.imageDataUrl} alt={WISH_COPY.resultAlt} />
                                </div>
                                <a
                                    className="result-card-save"
                                    href={expandedCard.downloadUrl || expandedCard.imageDataUrl}
                                    download={expandedCard.filename || `${WISH_COPY.downloadPrefix}-${Date.now()}.png`}
                                    onClick={(event) => event.stopPropagation()}
                                >
                                    {WISH_COPY.saveLabel}
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
