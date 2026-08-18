import { router, useFocusEffect } from 'expo-router';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity
} from 'react-native';
import { StatusBar, Text } from '@/components/Themed';
import PosterList from '@/components/PosterList';
import BottomSpacing from '@/components/BottomSpacing';
import AppleTVCarousel from '@/components/PosterCarousel';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { isHapticsSupported } from '@/utils/platform';
import { CatalogUrl, MovieGneres, TvGneres } from '@/constants/Tmdb';
import BlurGradientBackground from '@/components/BlurGradientBackground';

// Lazy loading wrapper component
const LazyPosterList = ({
  apiUrl,
  title,
  type,
  index
}: {
  apiUrl: string;
  title: string;
  type: 'movie' | 'series';
  index: number;
}) => {
  const [shouldLoad, setShouldLoad] = useState(index < 2); // Load first 2 immediately

  return (
    <View
      onLayout={() => {
        if (!shouldLoad) {
          setShouldLoad(true);
        }
      }}
    >
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
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh watch history when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setRefreshKey(prev => prev + 1);
    }, [])
  );

  // أزرار التصفية (تم الترجمة إلى العربية)
  const filters = [
    { key: 'all', label: 'الكل', icon: 'albums-outline' },
    { key: 'movies', label: 'أفلام', icon: 'film-outline' },
    { key: 'series', label: 'مسلسلات', icon: 'tv-outline' }
  ];

  // قائمة "الكل" (عناوين مترجمة)
  const allLists = useMemo(() => [
    { apiUrl: CatalogUrl.trendingMovies, title: 'الأفلام الرائجة', type: 'movie' },
    { apiUrl: CatalogUrl.trendingSeries, title: 'المسلسلات الرائجة', type: 'series' },
    { apiUrl: CatalogUrl.popularMovies, title: 'الأفلام الأكثر مشاهدة', type: 'movie' },
    { apiUrl: CatalogUrl.popularSeries, title: 'المسلسلات الأكثر مشاهدة', type: 'series' },
    { apiUrl: CatalogUrl.topMovies, title: 'أفضل الأفلام تقييماً', type: 'movie' },
    { apiUrl: CatalogUrl.topSeries, title: 'أفضل المسلسلات تقييماً', type: 'series' },
    { apiUrl: CatalogUrl.nowPlayingMovies, title: 'الأفلام المعروضة حالياً', type: 'movie' },
    { apiUrl: CatalogUrl.onTheAirTv, title: 'المسلسلات المعروضة حالياً', type: 'series' },
    { apiUrl: CatalogUrl.upcomingMovies, title: 'الأفلام القادمة', type: 'movie' },
    { apiUrl: CatalogUrl.airingTodayTv, title: 'المسلسلات التي تعرض اليوم', type: 'series' },
  ], []);

  // قائمة الأفلام (تصنيفات مترجمة)
  const movieLists = useMemo(() => [
    { apiUrl: CatalogUrl.trendingMovies, title: 'رائج', type: 'movie' },
    { apiUrl: CatalogUrl.nowPlayingMovies, title: 'يعرض حالياً', type: 'movie' },
    { apiUrl: MovieGneres.action, title: 'أكشن', type: 'movie' },
    { apiUrl: MovieGneres.adventure, title: 'مغامرة', type: 'movie' },
    { apiUrl: MovieGneres.scifi, title: 'خيال علمي', type: 'movie' },
    { apiUrl: MovieGneres.comedy, title: 'كوميدي', type: 'movie' },
    { apiUrl: MovieGneres.family, title: 'عائلي', type: 'movie' },
    { apiUrl: MovieGneres.animation, title: 'رسوم متحركة', type: 'movie' },
    { apiUrl: MovieGneres.thriller, title: 'إثارة', type: 'movie' },
    { apiUrl: MovieGneres.crime, title: 'جريمة', type: 'movie' },
    { apiUrl: MovieGneres.horror, title: 'رعب', type: 'movie' },
    { apiUrl: MovieGneres.mystery, title: 'غموض', type: 'movie' },
    { apiUrl: MovieGneres.fantasy, title: 'فانتازيا', type: 'movie' },
    { apiUrl: MovieGneres.drama, title: 'دراما', type: 'movie' },
  ], []);

  // قائمة المسلسلات (تصنيفات مترجمة)
  const seriesLists = useMemo(() => [
    { apiUrl: CatalogUrl.trendingSeries, title: 'رائج', type: 'series' },
    { apiUrl: TvGneres.actionAdventure, title: 'أكشن ومغامرة', type: 'series' },
    { apiUrl: TvGneres.drama, title: 'دراما', type: 'series' },
    { apiUrl: TvGneres.crime, title: 'جريمة', type: 'series' },
    { apiUrl: TvGneres.comedy, title: 'كوميدي', type: 'series' },
    { apiUrl: TvGneres.mystery, title: 'غموض', type: 'series' },
    { apiUrl: TvGneres.scifiFantsy, title: 'خيال علمي وفانتازيا', type: 'series' },
    { apiUrl: TvGneres.animation, title: 'رسوم متحركة', type: 'series' },
    { apiUrl: TvGneres.family, title: 'عائلي', type: 'series' },
    { apiUrl: TvGneres.kids, title: 'أطفال', type: 'series' },
  ], []);

  // اختيار القائمة المناسبة حسب التصفية
  const activeLists = useMemo(() => {
    if (filter === 'all') return allLists;
    if (filter === 'movies') return movieLists;
    if (filter === 'series') return seriesLists;
    return [];
  }, [filter, allLists, movieLists, seriesLists]);

  const handleFilterChange = async (newFilter: 'all' | 'movies' | 'series') => {
    if (await isHapticsSupported()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFilter(newFilter);
  };

  const handleCarouselItemPress = (item: any) => {
    const type = item.type == 'movie' ? 'movie' : 'series'
    router.push({
      pathname: `/${type}/details`,
      params: { moviedbid: item.moviedbid },
    });
  };

  return (
    <View style={[styles.container]}>
      <StatusBar />
      <BlurGradientBackground />
      {/* Scrollable content */}
      <ScrollView showsVerticalScrollIndicator={false} key={filter}>

        {/* Apple TV Carousel */}
        <AppleTVCarousel
          filter={filter}
          onItemPress={handleCarouselItemPress}
          autoPlay={true}
          autoPlayInterval={6000}
        />

        <View style={styles.contentContainer}>
          {/* Filter buttons - ستظهر الآن بالعربية */}
          <View style={[styles.filtersContainer]}>
            <FlatList
              data={filters}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
              keyExtractor={(item) => item.key}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filter === item.key && styles.filterButtonActive
                  ]}
                  onPress={() => handleFilterChange(item.key as 'all' | 'movies' | 'series')}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={18}
                    color={filter === item.key ? '#000000' : '#8E8E93'}
                    style={styles.filterIcon}
                  />
                  <Text
                    style={[
                      styles.filterButtonText,
                      filter === item.key && styles.filterButtonTextActive
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {activeLists.map((list, i) => (
            <LazyPosterList
              key={`${filter}-${i}`}
              apiUrl={list.apiUrl}
              title={list.title}
              type={list.type as 'movie' | 'series'}
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
  container: {
    flex: 1,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  filterRow: {
    paddingHorizontal: 10,
    gap: 15,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  filterButtonActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
  },
  filterIcon: {
    marginRight: 6,
  },
  filterButtonText: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  filterButtonTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  contentContainer: {
    marginTop: 16,
  },
});
