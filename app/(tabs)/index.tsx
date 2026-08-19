import { router, useFocusEffect } from 'expo-router';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  I18nManager
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar, Text } from '@/components/Themed';
import PosterList from '@/components/PosterList';
import BottomSpacing from '@/components/BottomSpacing';
import AppleTVCarousel from '@/components/PosterCarousel';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { isHapticsSupported } from '@/utils/platform';
import { CatalogUrl, MovieGneres, TvGneres } from '@/constants/Tmdb';
import BlurGradientBackground from '@/components/BlurGradientBackground';

// 1. كائن الترجمات الكامل
const translations = {
  ar: {
    all: 'الكل', movies: 'أفلام', series: 'مسلسلات',
    trendingMovies: 'أفلام - الرائجة', trendingSeries: 'مسلسلات - الرائجة',
    popularMovies: 'أفلام - الأكثر شهرة', popularSeries: 'مسلسلات - الأكثر شهرة',
    topMovies: 'أفلام - الأعلى تقييماً', topSeries: 'مسلسلات - الأعلى تقييماً',
    nowPlaying: 'أفلام - تعرض الآن', onAir: 'مسلسلات - تبث حالياً',
    upcoming: 'أفلام - قادمة قريباً', airingToday: 'مسلسلات - تعرض اليوم',
    trending: 'الرائج', action: 'أكشن', adventure: 'مغامرة',
    scifi: 'خيال علمي', comedy: 'كوميدي', family: 'عائلي',
    animation: 'أنيميشن', thriller: 'إثارة', crime: 'جريمة',
    horror: 'رعب', mystery: 'غموض', fantasy: 'فانتازيا',
    drama: 'دراما', kids: 'أطفال', actionAdventure: 'أكشن ومغامرة',
    scifiFantasy: 'خيال وفانتازيا',
  },
  en: {
    all: 'All', movies: 'Movies', series: 'Series',
    trendingMovies: 'Movies - Trending', trendingSeries: 'Series - Trending',
    popularMovies: 'Movies - Popular', popularSeries: 'Series - Popular',
    topMovies: 'Movies - Top Rated', topSeries: 'Series - Top Rated',
    nowPlaying: 'Movies - Now Playing', onAir: 'Series - On the Air',
    upcoming: 'Movies - Upcoming', airingToday: 'Series - Airing Today',
    trending: 'Trending', action: 'Action', adventure: 'Adventure',
    scifi: 'Sci-Fi', comedy: 'Comedy', family: 'Family',
    animation: 'Animation', thriller: 'Thriller', crime: 'Crime',
    horror: 'Horror', mystery: 'Mystery', fantasy: 'Fantasy',
    drama: 'Drama', kids: 'Kids', actionAdventure: 'Action & Adventure',
    scifiFantasy: 'Sci-Fi & Fantasy',
  },
  fr: {
    all: 'Tout', movies: 'Films', series: 'Séries',
    trendingMovies: 'Films - Tendances', trendingSeries: 'Séries - Tendances',
    popularMovies: 'Films - Populaires', popularSeries: 'Séries - Populaires',
    topMovies: 'Films - Les mieux notés', topSeries: 'Séries - Les mieux notées',
    nowPlaying: 'Films - En salle', onAir: 'Séries - En cours de diffusion',
    upcoming: 'Films - À venir', airingToday: 'Séries - Aujourd\'hui',
    trending: 'Tendances', action: 'Action', adventure: 'Aventure',
    scifi: 'Science-Fiction', comedy: 'Comédie', family: 'Famille',
    animation: 'Animation', thriller: 'Thriller', crime: 'Crime',
    horror: 'Horreur', mystery: 'Mystère', fantasy: 'Fantaisie',
    drama: 'Drame', kids: 'Enfants', actionAdventure: 'Action & Aventure',
    scifiFantasy: 'S-F & Fantaisie',
  }
};

const LazyPosterList = ({ apiUrl, title, type, index }: any) => {
  const [shouldLoad, setShouldLoad] = useState(index < 2);
  return (
    <View onLayout={() => !shouldLoad && setShouldLoad(true)}>
      {shouldLoad ? (
        <PosterList apiUrl={apiUrl} title={title} type={type} />
      ) : (
        <View style={{ height: 280, marginBottom: 20 }} />
      )}
    </View>
  );
};

export default function HomeScreen() {
  const [filter, setFilter] = useState<'all' | 'movies' | 'series'>('all');
  const [lang, setLang] = useState<'ar' | 'en' | 'fr'>('ar');
  const isRTL = lang === 'ar';

  // تحميل اللغة المحفوظة عند التشغيل
  useEffect(() => {
    const loadLang = async () => {
      const savedLang = await AsyncStorage.getItem('user-lang');
      if (savedLang) setLang(savedLang as any);
    };
    loadLang();
  }, []);

  const changeLanguage = async (newLang: 'ar' | 'en' | 'fr') => {
    setLang(newLang);
    await AsyncStorage.setItem('user-lang', newLang);
    if (await isHapticsSupported()) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const t = (key: keyof typeof translations['ar']) => translations[lang][key] || key;

  useFocusEffect(useCallback(() => { }, []));

  const filters = [
    { key: 'all', label: t('all'), icon: 'albums-outline' },
    { key: 'movies', label: t('movies'), icon: 'film-outline' },
    { key: 'series', label: t('series'), icon: 'tv-outline' }
  ];

  // الحفاظ على الأقسام الأصلية بالكامل مع الترجمة
  const allLists = useMemo(() => [
    { apiUrl: CatalogUrl.trendingMovies, title: t('trendingMovies'), type: 'movie' },
    { apiUrl: CatalogUrl.trendingSeries, title: t('trendingSeries'), type: 'series' },
    { apiUrl: CatalogUrl.popularMovies, title: t('popularMovies'), type: 'movie' },
    { apiUrl: CatalogUrl.popularSeries, title: t('popularSeries'), type: 'series' },
    { apiUrl: CatalogUrl.topMovies, title: t('topMovies'), type: 'movie' },
    { apiUrl: CatalogUrl.topSeries, title: t('topSeries'), type: 'series' },
    { apiUrl: CatalogUrl.nowPlayingMovies, title: t('nowPlaying'), type: 'movie' },
    { apiUrl: CatalogUrl.onTheAirTv, title: t('onAir'), type: 'series' },
    { apiUrl: CatalogUrl.upcomingMovies, title: t('upcoming'), type: 'movie' },
    { apiUrl: CatalogUrl.airingTodayTv, title: t('airingToday'), type: 'series' },
  ], [lang]);

  const movieLists = useMemo(() => [
    { apiUrl: CatalogUrl.trendingMovies, title: t('trending'), type: 'movie' },
    { apiUrl: CatalogUrl.nowPlayingMovies, title: t('nowPlaying'), type: 'movie' },
    { apiUrl: MovieGneres.action, title: t('action'), type: 'movie' },
    { apiUrl: MovieGneres.adventure, title: t('adventure'), type: 'movie' },
    { apiUrl: MovieGneres.scifi, title: t('scifi'), type: 'movie' },
    { apiUrl: MovieGneres.comedy, title: t('comedy'), type: 'movie' },
    { apiUrl: MovieGneres.family, title: t('family'), type: 'movie' },
    { apiUrl: MovieGneres.animation, title: t('animation'), type: 'movie' },
    { apiUrl: MovieGneres.thriller, title: t('thriller'), type: 'movie' },
    { apiUrl: MovieGneres.crime, title: t('crime'), type: 'movie' },
    { apiUrl: MovieGneres.horror, title: t('horror'), type: 'movie' },
    { apiUrl: MovieGneres.mystery, title: t('mystery'), type: 'movie' },
    { apiUrl: MovieGneres.fantasy, title: t('fantasy'), type: 'movie' },
    { apiUrl: MovieGneres.drama, title: t('drama'), type: 'movie' },
  ], [lang]);

  const seriesLists = useMemo(() => [
    { apiUrl: CatalogUrl.trendingSeries, title: t('trending'), type: 'series' },
    { apiUrl: TvGneres.actionAdventure, title: t('actionAdventure'), type: 'series' },
    { apiUrl: TvGneres.drama, title: t('drama'), type: 'series' },
    { apiUrl: TvGneres.crime, title: t('crime'), type: 'series' },
    { apiUrl: TvGneres.comedy, title: t('comedy'), type: 'series' },
    { apiUrl: TvGneres.mystery, title: t('mystery'), type: 'series' },
    { apiUrl: TvGneres.scifiFantsy, title: t('scifiFantasy'), type: 'series' },
    { apiUrl: TvGneres.animation, title: t('animation'), type: 'series' },
    { apiUrl: TvGneres.family, title: t('family'), type: 'series' },
    { apiUrl: TvGneres.kids, title: t('kids'), type: 'series' },
  ], [lang]);

  const activeLists = useMemo(() => {
    if (filter === 'all') return allLists;
    if (filter === 'movies') return movieLists;
    return seriesLists;
  }, [filter, allLists, movieLists, seriesLists]);

  return (
    <View style={styles.container}>
      <StatusBar />
      <BlurGradientBackground />
      <ScrollView showsVerticalScrollIndicator={false} key={`${filter}-${lang}`}>
        
        {/* اختيار اللغة الاحترافي */}
        <View style={[styles.langBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={() => changeLanguage('ar')} style={styles.langItem}>
            <Text style={[styles.langText, lang === 'ar' && styles.langActive]}>العربية</Text>
          </TouchableOpacity>
          <View style={styles.langDivider} />
          <TouchableOpacity onPress={() => changeLanguage('en')} style={styles.langItem}>
            <Text style={[styles.langText, lang === 'en' && styles.langActive]}>English</Text>
          </TouchableOpacity>
          <View style={styles.langDivider} />
          <TouchableOpacity onPress={() => changeLanguage('fr')} style={styles.langItem}>
            <Text style={[styles.langText, lang === 'fr' && styles.langActive]}>Français</Text>
          </TouchableOpacity>
        </View>

        <AppleTVCarousel
          filter={filter}
          onItemPress={(item) => router.push({ pathname: `/${item.type === 'movie' ? 'movie' : 'series'}/details`, params: { moviedbid: item.moviedbid } })}
          autoPlay={true}
          autoPlayInterval={6000}
        />

        <View style={styles.contentContainer}>
          <View style={styles.filtersContainer}>
            <FlatList
              data={filters}
              horizontal
              inverted={isRTL}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.filterButton, filter === item.key && styles.filterButtonActive]}
                  onPress={() => setFilter(item.key as any)}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={filter === item.key ? '#000000' : '#8E8E93'}
                    style={{ [isRTL ? 'marginLeft' : 'marginRight']: 8 }}
                  />
                  <Text style={[styles.filterButtonText, filter === item.key && styles.filterButtonTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {activeLists.map((list, i) => (
            <LazyPosterList
              key={`${filter}-${lang}-${i}`}
              apiUrl={list.apiUrl}
              title={list.title}
              type={list.type as any}
              index={i}
            />
          ))}
        </View>
        <BottomSpacing space={50} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  langBar: {
    paddingTop: 55,
    paddingBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  langItem: { paddingHorizontal: 10 },
  langText: { fontSize: 13, color: '#666', fontWeight: '500' },
  langActive: { color: '#fff', fontWeight: 'bold' },
  langDivider: { width: 1, height: 12, backgroundColor: '#333' },
  filtersContainer: { paddingVertical: 12 },
  filterRow: { paddingHorizontal: 15, gap: 12 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(26,26,26,0.8)',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterButtonActive: { backgroundColor: '#fff', borderColor: '#fff' },
  filterButtonText: { fontSize: 15, color: '#8E8E93', fontWeight: '600' },
  filterButtonTextActive: { color: '#000', fontWeight: '700' },
  contentContainer: { marginTop: 10 },
});
