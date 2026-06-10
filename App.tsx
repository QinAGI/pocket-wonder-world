import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Tab = 'world' | 'create' | 'card';
type WorldTheme = {
  id: string;
  name: string;
  icon: string;
  subtitle: string;
  sky: readonly [string, string, ...string[]];
  nightSky: readonly [string, string, ...string[]];
  ground: string;
  accent: string;
  hero: string;
  landmark: string;
  defaultItems: string[];
};

const THEMES: WorldTheme[] = [
  {
    id: 'magic',
    name: '魔法森林',
    icon: '✦',
    subtitle: '星光藏在每一片叶子里',
    sky: ['#7657E8', '#C77DFF', '#FFB4D9'],
    nightSky: ['#17133F', '#31246D', '#6941A5'],
    ground: '#335E4B',
    accent: '#E8FF7A',
    hero: '🧙',
    landmark: '🏰',
    defaultItems: ['🌳', '🍄', '🦋'],
  },
  {
    id: 'space',
    name: '太空基地',
    icon: '◉',
    subtitle: '下一站，由你命名',
    sky: ['#172554', '#3B2F80', '#8356B9'],
    nightSky: ['#050816', '#111A3D', '#25205B'],
    ground: '#565D78',
    accent: '#79F2FF',
    hero: '👩‍🚀',
    landmark: '🚀',
    defaultItems: ['🪐', '🛰️', '👾'],
  },
  {
    id: 'ocean',
    name: '海底秘境',
    icon: '≈',
    subtitle: '把秘密交给会发光的海',
    sky: ['#1CC8C8', '#1677C8', '#234E9C'],
    nightSky: ['#062F4F', '#0B4266', '#142C5E'],
    ground: '#1B6470',
    accent: '#9CFFEC',
    hero: '🧜',
    landmark: '🐚',
    defaultItems: ['🐠', '🪸', '🐙'],
  },
  {
    id: 'candy',
    name: '甜品云城',
    icon: '♡',
    subtitle: '今天的云朵是草莓味',
    sky: ['#85D8FF', '#D1B8FF', '#FFBADC'],
    nightSky: ['#4A356F', '#754B8B', '#A65A91'],
    ground: '#F099B6',
    accent: '#FFF47D',
    hero: '🧚',
    landmark: '🍰',
    defaultItems: ['🍭', '🧁', '☁️'],
  },
  {
    id: 'dino',
    name: '恐龙岛',
    icon: '▲',
    subtitle: '嘘，脚下有一颗蛋',
    sky: ['#43B9A0', '#81CE87', '#D4E67A'],
    nightSky: ['#153D3B', '#225A4C', '#355C3A'],
    ground: '#477A3E',
    accent: '#FFDB57',
    hero: '🦖',
    landmark: '🌋',
    defaultItems: ['🌴', '🥚', '🦕'],
  },
  {
    id: 'music',
    name: '音乐霓虹城',
    icon: '♫',
    subtitle: '让整座城市跟着你跳',
    sky: ['#FF3D77', '#8739CE', '#2531A8'],
    nightSky: ['#270A3A', '#380D64', '#10104A'],
    ground: '#252142',
    accent: '#52FFB8',
    hero: '🕺',
    landmark: '🎡',
    defaultItems: ['🎸', '🎧', '🎹'],
  },
];

const ITEM_LIBRARY = ['🌳', '🍄', '🦋', '🪐', '🛰️', '👾', '🐠', '🪸', '🐙', '🍭', '🧁', '☁️', '🌴', '🥚', '🦕', '🎸', '🎧', '🎹'];
const RAIN = ['✦', '●', '◆', '♥', '★', '✧', '●', '★', '◆', '✦', '♥', '✧'];

function tapFeedback() {
  if (Platform.OS !== 'web') {
    void Haptics.selectionAsync();
  }
}

function Floaty({
  children,
  distance = 8,
  duration = 2200,
}: {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
}) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: -distance,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [distance, duration, value]);

  return <Animated.View style={{ transform: [{ translateY: value }] }}>{children}</Animated.View>;
}

function WorldScene({
  theme,
  items,
  night,
  raining,
  dancing,
  onToggleNight,
  onDance,
}: {
  theme: WorldTheme;
  items: string[];
  night: boolean;
  raining: boolean;
  dancing: boolean;
  onToggleNight: () => void;
  onDance: () => void;
}) {
  const dance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!dancing) {
      dance.setValue(0);
      return;
    }
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dance, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(dance, { toValue: -1, duration: 150, useNativeDriver: true }),
        Animated.timing(dance, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]),
      { iterations: 5 },
    );
    animation.start();
    return () => animation.stop();
  }, [dance, dancing]);

  return (
    <View style={styles.sceneShell}>
      <LinearGradient colors={night ? theme.nightSky : theme.sky} style={styles.scene}>
        <View style={styles.stars}>
          {['✦', '·', '✧', '·', '✦', '·'].map((star, index) => (
            <Text
              key={`${star}-${index}`}
              style={[styles.star, { left: `${8 + index * 16}%`, top: 18 + (index % 3) * 27, opacity: night ? 0.95 : 0.45 }]}
            >
              {star}
            </Text>
          ))}
        </View>

        <Pressable
          accessibilityLabel="切换白天和夜晚"
          onPress={() => {
            tapFeedback();
            onToggleNight();
          }}
          style={({ pressed }) => [styles.sunButton, pressed && styles.pressed]}
        >
          <Text style={styles.sun}>{night ? '🌙' : '☀️'}</Text>
        </Pressable>

        <View style={styles.cloudRow}>
          <Floaty distance={5} duration={2600}>
            <Text style={styles.cloud}>☁️</Text>
          </Floaty>
          <Floaty distance={7} duration={3100}>
            <Text style={[styles.cloud, styles.smallCloud]}>☁️</Text>
          </Floaty>
        </View>

        <Floaty distance={7} duration={2100}>
          <Text style={styles.landmark}>{theme.landmark}</Text>
        </Floaty>

        <View style={[styles.ground, { backgroundColor: theme.ground }]}>
          <View style={styles.itemRow}>
            {items.slice(0, 5).map((item, index) => (
              <Floaty key={`${item}-${index}`} distance={index % 2 ? 5 : 8} duration={1900 + index * 250}>
                <Text style={[styles.worldItem, index % 2 === 1 && styles.worldItemSmall]}>{item}</Text>
              </Floaty>
            ))}
          </View>

          <Pressable
            accessibilityLabel="让主角跳舞"
            onPress={() => {
              tapFeedback();
              onDance();
            }}
          >
            <Animated.Text
              style={[
                styles.hero,
                {
                  transform: [
                    {
                      rotate: dance.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: ['-14deg', '0deg', '14deg'],
                      }),
                    },
                    {
                      translateY: dance.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: [-8, 0, -8],
                      }),
                    },
                  ],
                },
              ]}
            >
              {theme.hero}
            </Animated.Text>
          </Pressable>
        </View>

        {raining && (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            {RAIN.map((drop, index) => (
              <FallingDrop key={`${drop}-${index}`} symbol={drop} index={index} color={theme.accent} />
            ))}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

function FallingDrop({ symbol, index, color }: { symbol: string; index: number; color: string }) {
  const fall = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(fall, {
        toValue: 470,
        duration: 1300 + (index % 4) * 240,
        delay: index * 90,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [fall, index]);

  return (
    <Animated.Text
      style={[
        styles.rainDrop,
        {
          color,
          left: `${4 + index * 8}%`,
          transform: [{ translateY: fall }, { rotate: `${index * 17}deg` }],
        },
      ]}
    >
      {symbol}
    </Animated.Text>
  );
}

function PillButton({
  label,
  icon,
  active,
  accent,
  onPress,
}: {
  label: string;
  icon: string;
  active?: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [
        styles.pillButton,
        active && { backgroundColor: accent, borderColor: accent },
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.pillIcon}>{icon}</Text>
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.heading}>{title}</Text>
    </View>
  );
}

export default function App() {
  const scrollRef = useRef<ScrollView>(null);
  const [tab, setTab] = useState<Tab>('world');
  const [themeId, setThemeId] = useState('magic');
  const [worldName, setWorldName] = useState('月光泡泡岛');
  const [creatorName, setCreatorName] = useState('小小造梦家');
  const [night, setNight] = useState(false);
  const [raining, setRaining] = useState(false);
  const [dancing, setDancing] = useState(false);
  const [itemsByTheme, setItemsByTheme] = useState<Record<string, string[]>>(
    Object.fromEntries(THEMES.map((theme) => [theme.id, theme.defaultItems])),
  );

  const theme = useMemo(() => THEMES.find((item) => item.id === themeId) ?? THEMES[0], [themeId]);
  const items = itemsByTheme[theme.id] ?? theme.defaultItems;

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [tab]);

  const triggerDance = () => {
    setDancing(false);
    requestAnimationFrame(() => setDancing(true));
    setTimeout(() => setDancing(false), 2400);
  };

  const toggleItem = (item: string) => {
    setItemsByTheme((current) => {
      const currentItems = current[theme.id] ?? [];
      const exists = currentItems.includes(item);
      if (!exists && currentItems.length >= 5) return current;
      return {
        ...current,
        [theme.id]: exists ? currentItems.filter((value) => value !== item) : [...currentItems, item],
      };
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.logo}>WONDER POCKET</Text>
            <Text style={styles.logoCn}>口袋奇妙世界</Text>
          </View>
          <View style={[styles.sparkBadge, { backgroundColor: theme.accent }]}>
            <Text style={styles.sparkText}>✦ 造梦中</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {tab === 'world' && (
            <>
              <View style={styles.heroCopy}>
                <Text style={styles.kicker}>欢迎来到</Text>
                <Text style={styles.worldTitle}>{worldName || '未命名世界'}</Text>
                <Text style={styles.worldSubtitle}>{theme.subtitle}</Text>
              </View>

              <WorldScene
                theme={theme}
                items={items}
                night={night}
                raining={raining}
                dancing={dancing}
                onToggleNight={() => setNight((value) => !value)}
                onDance={triggerDance}
              />

              <View style={styles.actionPanel}>
                <Text style={styles.actionHint}>试着唤醒这个世界</Text>
                <View style={styles.actionRow}>
                  <PillButton
                    label={night ? '点亮白天' : '召唤月亮'}
                    icon={night ? '☀️' : '🌙'}
                    accent={theme.accent}
                    onPress={() => setNight((value) => !value)}
                  />
                  <PillButton
                    label={raining ? '雨停啦' : '奇妙彩雨'}
                    icon="✦"
                    active={raining}
                    accent={theme.accent}
                    onPress={() => setRaining((value) => !value)}
                  />
                  <PillButton label="一起跳舞" icon="♫" accent={theme.accent} onPress={triggerDance} />
                </View>
              </View>

              <Pressable
                onPress={() => setTab('create')}
                style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.accent }, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>继续创造我的世界</Text>
                <Text style={styles.primaryArrow}>→</Text>
              </Pressable>
            </>
          )}

          {tab === 'create' && (
            <>
              <SectionTitle eyebrow="STEP 01" title="选一个世界入口" />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeList}>
                {THEMES.map((option) => {
                  const selected = option.id === theme.id;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => {
                        tapFeedback();
                        setThemeId(option.id);
                        setNight(false);
                        setRaining(false);
                      }}
                      style={({ pressed }) => [
                        styles.themeCard,
                        selected && { borderColor: option.accent, borderWidth: 3 },
                        pressed && styles.pressed,
                      ]}
                    >
                      <LinearGradient colors={option.sky} style={styles.themePreview}>
                        <Text style={styles.themeIcon}>{option.hero}</Text>
                        <Text style={styles.themeLandmark}>{option.landmark}</Text>
                      </LinearGradient>
                      <Text style={styles.themeName}>{option.name}</Text>
                      <Text style={styles.themeMini}>{option.subtitle}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <SectionTitle eyebrow="STEP 02" title="给它一个响亮的名字" />
              <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>世界名称</Text>
                <TextInput
                  value={worldName}
                  onChangeText={setWorldName}
                  maxLength={12}
                  placeholder="例如：月光泡泡岛"
                  placeholderTextColor="#9993A5"
                  style={styles.input}
                />
                <Text style={styles.counter}>{worldName.length}/12</Text>
              </View>

              <SectionTitle eyebrow="STEP 03" title="放进喜欢的东西" />
              <Text style={styles.helper}>最多选择5个，点击就能加入或移走</Text>
              <View style={styles.itemGrid}>
                {ITEM_LIBRARY.map((item) => {
                  const selected = items.includes(item);
                  return (
                    <Pressable
                      key={item}
                      onPress={() => {
                        tapFeedback();
                        toggleItem(item);
                      }}
                      style={({ pressed }) => [
                        styles.itemChoice,
                        selected && { backgroundColor: theme.accent, borderColor: theme.accent },
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text style={styles.itemEmoji}>{item}</Text>
                      {selected && <Text style={styles.itemCheck}>✓</Text>}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.miniScene}>
                <WorldScene
                  theme={theme}
                  items={items}
                  night={night}
                  raining={false}
                  dancing={false}
                  onToggleNight={() => setNight((value) => !value)}
                  onDance={triggerDance}
                />
              </View>

              <Pressable
                onPress={() => setTab('card')}
                style={({ pressed }) => [styles.primaryButton, { backgroundColor: theme.accent }, pressed && styles.pressed]}
              >
                <Text style={styles.primaryButtonText}>生成世界邀请卡</Text>
                <Text style={styles.primaryArrow}>→</Text>
              </Pressable>
            </>
          )}

          {tab === 'card' && (
            <>
              <SectionTitle eyebrow="YOUR WORLD" title="世界邀请卡已生成" />
              <View style={styles.inviteOuter}>
                <LinearGradient colors={theme.sky} style={styles.inviteCard}>
                  <View style={styles.inviteTop}>
                    <Text style={styles.inviteBrand}>WONDER POCKET</Text>
                    <Text style={styles.inviteNumber}>NO. {theme.id.toUpperCase()}-001</Text>
                  </View>

                  <View style={styles.inviteOrbit}>
                    <Text style={styles.orbitText}>✦　·　✧　·　✦　·　✧</Text>
                    <Floaty distance={9} duration={2000}>
                      <Text style={styles.inviteLandmark}>{theme.landmark}</Text>
                    </Floaty>
                    <Text style={styles.inviteHero}>{theme.hero}</Text>
                  </View>

                  <Text style={styles.inviteSmall}>特邀你进入</Text>
                  <Text style={styles.inviteTitle}>{worldName || '未命名世界'}</Text>
                  <Text style={styles.inviteSubtitle}>{theme.subtitle}</Text>

                  <View style={styles.inviteItems}>
                    {items.map((item, index) => (
                      <View key={`${item}-${index}`} style={styles.inviteItemBubble}>
                        <Text style={styles.inviteItem}>{item}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.inviteFooter}>
                    <View>
                      <Text style={styles.creatorLabel}>世界创造者</Text>
                      <TextInput
                        value={creatorName}
                        onChangeText={setCreatorName}
                        maxLength={10}
                        style={styles.creatorInput}
                      />
                    </View>
                    <View style={[styles.ticketStamp, { borderColor: theme.accent }]}>
                      <Text style={styles.ticketStampIcon}>✦</Text>
                      <Text style={styles.ticketStampText}>无限次入场</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.cardTip}>
                <Text style={styles.cardTipIcon}>◎</Text>
                <View style={styles.cardTipCopy}>
                  <Text style={styles.cardTipTitle}>这是你的作品，不是标准答案</Text>
                  <Text style={styles.cardTipText}>换一种颜色、角色和规则，它就会变成完全不同的世界。</Text>
                </View>
              </View>

              <Pressable
                onPress={() => setTab('world')}
                style={({ pressed }) => [styles.darkButton, pressed && styles.pressed]}
              >
                <Text style={styles.darkButtonText}>进入我的世界</Text>
                <Text style={styles.darkButtonArrow}>✦</Text>
              </Pressable>
            </>
          )}
        </ScrollView>

        <View style={styles.tabBar}>
          {([
            ['world', '◉', '探索'],
            ['create', '＋', '创造'],
            ['card', '◇', '邀请卡'],
          ] as const).map(([id, icon, label]) => {
            const active = tab === id;
            return (
              <Pressable
                key={id}
                onPress={() => {
                  tapFeedback();
                  setTab(id);
                }}
                style={styles.tab}
              >
                <View style={[styles.tabIconWrap, active && { backgroundColor: theme.accent }]}>
                  <Text style={styles.tabIcon}>{icon}</Text>
                </View>
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8F6F1' },
  app: { flex: 1, width: '100%', maxWidth: 720, alignSelf: 'center', backgroundColor: '#F8F6F1' },
  topBar: {
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 18 : 10,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { color: '#706A79', fontSize: 9, fontWeight: '900', letterSpacing: 2.2 },
  logoCn: { color: '#201C27', fontSize: 19, fontWeight: '900', marginTop: 1, letterSpacing: 0.3 },
  sparkBadge: { borderRadius: 99, paddingVertical: 8, paddingHorizontal: 13 },
  sparkText: { color: '#201C27', fontSize: 12, fontWeight: '900' },
  content: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 125 },
  heroCopy: { marginTop: 14, marginBottom: 18, paddingHorizontal: 4 },
  kicker: { color: '#756F7D', fontSize: 13, fontWeight: '700' },
  worldTitle: { color: '#201C27', fontSize: 36, lineHeight: 44, fontWeight: '900', letterSpacing: -1.5 },
  worldSubtitle: { color: '#756F7D', fontSize: 14, marginTop: 3 },
  sceneShell: {
    height: 430,
    borderRadius: 34,
    overflow: 'hidden',
    backgroundColor: '#6A55C9',
    shadowColor: '#382B5A',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  scene: { flex: 1, overflow: 'hidden' },
  stars: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  star: { position: 'absolute', color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  sunButton: { position: 'absolute', right: 24, top: 24, zIndex: 5 },
  sun: { fontSize: 47 },
  cloudRow: {
    position: 'absolute',
    left: 14,
    right: 92,
    top: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    opacity: 0.82,
  },
  cloud: { fontSize: 52 },
  smallCloud: { fontSize: 36, opacity: 0.72 },
  landmark: { position: 'absolute', alignSelf: 'center', top: 122, fontSize: 122 },
  ground: {
    position: 'absolute',
    left: -50,
    right: -50,
    bottom: -80,
    height: 250,
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
  },
  itemRow: {
    position: 'absolute',
    top: 23,
    left: 62,
    right: 62,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  worldItem: { fontSize: 47 },
  worldItemSmall: { fontSize: 36 },
  hero: {
    position: 'absolute',
    alignSelf: 'center',
    top: 72,
    fontSize: 74,
    zIndex: 4,
    textShadowColor: 'rgba(0,0,0,0.16)',
    textShadowOffset: { width: 0, height: 5 },
    textShadowRadius: 8,
  },
  rainDrop: { position: 'absolute', top: -30, fontSize: 20, fontWeight: '900', zIndex: 10 },
  pressed: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  actionPanel: { marginTop: 30 },
  actionHint: { color: '#756F7D', fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 10, marginLeft: 4 },
  actionRow: { flexDirection: 'row', gap: 8 },
  pillButton: {
    flex: 1,
    minHeight: 72,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E1DDE5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pillIcon: { fontSize: 21, color: '#201C27', fontWeight: '900' },
  pillLabel: { color: '#625C69', fontSize: 10, fontWeight: '800', marginTop: 5 },
  pillLabelActive: { color: '#201C27' },
  primaryButton: {
    marginTop: 22,
    minHeight: 62,
    borderRadius: 20,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryButtonText: { color: '#201C27', fontSize: 16, fontWeight: '900' },
  primaryArrow: { color: '#201C27', fontSize: 26, fontWeight: '500' },
  sectionTitle: { marginTop: 24, marginBottom: 13, paddingHorizontal: 3 },
  eyebrow: { color: '#8C8494', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  heading: { color: '#201C27', fontSize: 26, fontWeight: '900', letterSpacing: -0.7, marginTop: 3 },
  themeList: { gap: 12, paddingVertical: 4, paddingRight: 16 },
  themeCard: {
    width: 154,
    borderRadius: 24,
    padding: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2E9',
  },
  themePreview: {
    height: 112,
    borderRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeIcon: { fontSize: 43, zIndex: 2 },
  themeLandmark: { position: 'absolute', fontSize: 76, opacity: 0.48, right: -3, bottom: -10 },
  themeName: { color: '#201C27', fontSize: 15, fontWeight: '900', marginTop: 10, marginHorizontal: 5 },
  themeMini: { color: '#88818E', fontSize: 9, lineHeight: 13, height: 28, marginTop: 3, marginHorizontal: 5, marginBottom: 4 },
  inputCard: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 17, borderWidth: 1, borderColor: '#E7E2E9' },
  inputLabel: { color: '#817A89', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  input: {
    color: '#201C27',
    fontSize: 23,
    fontWeight: '900',
    paddingVertical: 7,
    paddingRight: 50,
    borderBottomWidth: 2,
    borderBottomColor: '#EEE9F0',
  },
  counter: { position: 'absolute', right: 18, bottom: 27, color: '#9992A0', fontSize: 11, fontWeight: '700' },
  helper: { color: '#837C8A', fontSize: 12, marginTop: -8, marginBottom: 13, marginLeft: 3 },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  itemChoice: {
    width: '14.8%',
    minWidth: 50,
    aspectRatio: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E6E1E8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemEmoji: { fontSize: 27 },
  itemCheck: {
    position: 'absolute',
    top: 3,
    right: 5,
    color: '#201C27',
    fontSize: 10,
    fontWeight: '900',
  },
  miniScene: { marginTop: 26, height: 430, transform: [{ scale: 0.97 }] },
  inviteOuter: {
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    padding: 8,
    shadowColor: '#33283F',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  inviteCard: { minHeight: 560, borderRadius: 28, padding: 22, overflow: 'hidden' },
  inviteTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  inviteBrand: { color: '#FFFFFF', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  inviteNumber: { color: 'rgba(255,255,255,0.75)', fontSize: 8, fontWeight: '800' },
  inviteOrbit: { height: 240, alignItems: 'center', justifyContent: 'center' },
  orbitText: { position: 'absolute', top: 30, color: 'rgba(255,255,255,0.75)', fontSize: 18 },
  inviteLandmark: { fontSize: 135, opacity: 0.9 },
  inviteHero: { position: 'absolute', bottom: 14, fontSize: 64 },
  inviteSmall: { color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  inviteTitle: {
    color: '#FFFFFF',
    fontSize: 35,
    lineHeight: 43,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -1.3,
    textShadowColor: 'rgba(40,20,60,0.2)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  inviteSubtitle: { color: 'rgba(255,255,255,0.84)', fontSize: 12, textAlign: 'center', marginTop: 4 },
  inviteItems: { flexDirection: 'row', justifyContent: 'center', gap: 7, marginTop: 18 },
  inviteItemBubble: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteItem: { fontSize: 22 },
  inviteFooter: {
    marginTop: 26,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.28)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  creatorLabel: { color: 'rgba(255,255,255,0.68)', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  creatorInput: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', paddingVertical: 3, minWidth: 120 },
  ticketStamp: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  ticketStampIcon: { color: '#FFFFFF', fontSize: 20, fontWeight: '900' },
  ticketStampText: { color: '#FFFFFF', fontSize: 8, fontWeight: '900', marginTop: 2 },
  cardTip: {
    marginTop: 24,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E2E9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTipIcon: { color: '#201C27', fontSize: 30, fontWeight: '300', marginRight: 13 },
  cardTipCopy: { flex: 1 },
  cardTipTitle: { color: '#201C27', fontSize: 13, fontWeight: '900' },
  cardTipText: { color: '#817A88', fontSize: 11, lineHeight: 17, marginTop: 3 },
  darkButton: {
    minHeight: 62,
    marginTop: 16,
    borderRadius: 20,
    paddingHorizontal: 22,
    backgroundColor: '#201C27',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  darkButtonArrow: { color: '#FFFFFF', fontSize: 22 },
  tabBar: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: Platform.OS === 'ios' ? 12 : 14,
    height: 76,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: '#E8E3E9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#3D3545',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { color: '#201C27', fontSize: 18, fontWeight: '900' },
  tabLabel: { color: '#948D99', fontSize: 9, fontWeight: '800', marginTop: 2 },
  tabLabelActive: { color: '#201C27' },
});
