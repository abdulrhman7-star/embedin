import { router } from 'expo-router';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { StatusBar, Text } from '@/components/Themed';
import PosterList from '@/components/PosterList';
import BottomSpacing from '@/components/BottomSpacing';
import AppleTVCarousel from '@/components/PosterCarousel';

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { isHapticsSupported } from '@/utils/platform';
import {
  CatalogUrl,
  MovieGneres,
  TvGneres,
} from '@/constants/Tmdb';

import BlurGradientBackground from '@/components/BlurGradientBackground';

/* =========================================================
   Types
========================================================= */

type Language = 'ar' | 'en' | 'fr';

type Filter = 'all' | 'movies' | 'series';

type ListType = 'movie' | 'series';

type TranslationKey =
  | 'all'
  | 'movies'
  | 'series'
  | 'trendingMovies'
  | 'trendingSeries'
  | 'popularMovies'
  | 'popularSeries'
  | 'topMovies'
  | 'topSeries'
  | 'nowPlaying'
  | 'onAir'
  | 'upcoming'
  | 'airingToday'
  | 'trending'
  | 'action'
  | 'adventure'
  | 'scifi'
  | 'comedy'
  | 'family'
  | 'animation'
  | 'thriller'
  | 'crime'
  | 'horror'
  | 'mystery'
  | 'fantasy'
  | 'drama'
  | 'kids'
  | 'actionAdventure'
  | 'scifiFantasy';

interface ContentList {
  apiUrl: string;
  title: string;
  type: ListType;
}

/* =========================================================
   Constants
========================================================= */

const LANGUAGE_STORAGE_KEY = '@embedin_language';

/* =========================================================
   Translations
========================================================= */

const translations: Record<
  Language,
  Record<TranslationKey, string>
> = {
  ar: {
    all: 'الكل',
    movies: 'أفلام',
    series: 'مسلسلات',

    trendingMovies: 'أفلام - الرائجة',
    trendingSeries: 'مسلسلات - الرائجة',

    popularMovies: 'أفلام - الأكثر شهرة',
    popularSeries: 'مسلسلات - الأكثر شهرة',

    topMovies: 'أفلام - الأعلى تقييماً',
    topSeries: 'مسلسلات - الأعلى تقييماً',

    nowPlaying: 'أفلام - تعرض الآن',
    onAir: 'مسلسلات - تبث حالياً',

    upcoming: 'أفلام - قادمة قريباً',
    airingToday: 'مسلسلات - تعرض اليوم',

    trending: 'الرائج',

    action: 'أكشن',
    adventure: 'مغامرة',
    scifi: 'خيال علمي',
    comedy: 'كوميدي',
    family: 'عائلي',
    animation: 'أنيميشن',
    thriller: 'إثارة',
    crime: 'جريمة',
    horror: 'رعب',
    mystery: 'غموض',
    fantasy: 'فانتازيا',
    drama: 'دراما',
    kids: 'أطفال',

    actionAdventure: 'أكشن ومغامرة',
    scifiFantasy: 'خيال وفانتازيا',
  },

  en: {
    all: 'All',
    movies: 'Movies',
    series: 'Series',

    trendingMovies: 'Movies - Trending',
    trendingSeries: 'Series - Trending',

    popularMovies: 'Movies - Popular',
    popularSeries: 'Series - Popular',

    topMovies: 'Movies - Top Rated',
    topSeries: 'Series - Top Rated',

    nowPlaying: 'Movies - Now Playing',
    onAir: 'Series - On the Air',

    upcoming: 'Movies - Upcoming',
    airingToday: 'Series - Airing Today',

    trending: 'Trending',

    action: 'Action',
    adventure: 'Adventure',
    scifi: 'Sci-Fi',
    comedy: 'Comedy',
    family: 'Family',
    animation: 'Animation',
    thriller: 'Thriller',
    crime: 'Crime',
    horror: 'Horror',
    mystery: 'Mystery',
    fantasy: 'Fantasy',
    drama: 'Drama',
    kids: 'Kids',

    actionAdventure: 'Action & Adventure',
    scifiFantasy: 'Sci-Fi & Fantasy',
  },

  fr: {
    all: 'Tout',
    movies: 'Films',
    series: 'Séries',

    trendingMovies: 'Films - Tendances',
    trendingSeries: 'Séries - Tendances',

    popularMovies: 'Films - Populaires',
    popularSeries: 'Séries - Populaires',

    topMovies: 'Films - Les mieux notés',
    topSeries: 'Séries - Les mieux notées',

    nowPlaying: 'Films - À l’affiche',
    onAir: 'Séries - En cours de diffusion',

    upcoming: 'Films - À venir',
    airingToday: 'Séries - Diffusées aujourd’hui',

    trending: 'Tendances',

    action: 'Action',
    adventure: 'Aventure',
    scifi: 'Science-fiction',
    comedy: 'Comédie',
    family: 'Famille',
    animation: 'Animation',
    thriller: 'Thriller',
    crime: 'Crime',
    horror: 'Horreur',
    mystery: 'Mystère',
    fantasy: 'Fantaisie',
    drama: 'Drame',
    kids: 'Enfants',

    actionAdventure: 'Action & Aventure',
    scifiFantasy: 'Science-fiction & Fantastique',
  },
};

/* =========================================================
   Lazy Poster List
========================================================= */

const LazyPosterList = ({
  apiUrl,
  title,
  type,
  index,
}: {
  apiUrl: string;
  title: string;
  type: ListType;
  index: number;
}) => {
  const [shouldLoad, setShouldLoad] = useState(index < 2);

  const handleLayout = useCallback(() => {
    if (!shouldLoad) {
      setShouldLoad(true);
    }
  }, [shouldLoad]);

  return (
    <View onLayout={handleLayout}>
      {shouldLoad ? (
        <PosterList
          apiUrl={apiUrl}
          title={title}
          type={type}
        />
      ) : (
        <View
          style={{
            height: 280,
            marginBottom: 20,
          }}
        />
      )}
    </View>
  );
};

/* =========================================================
   Home Screen
========================================================= */

export default function HomeScreen() {
  const [filter, setFilter] = useState<Filter>('all');

  /*
   * العربية هي اللغة الافتراضية.
   * سيتم استبدالها باللغة المحفوظة إذا كانت موجودة.
   */
  const [language, setLanguage] =
    useState<Language>('ar');

  const [isLoadingLanguage, setIsLoadingLanguage] =
    useState(true);

  const isRTL = language === 'ar';

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[language][key];
    },
    [language]
  );

  /* =======================================================
     Load Saved Language
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadSavedLanguage = async () => {
      try {
        const savedLanguage =
          await AsyncStorage.getItem(
            LANGUAGE_STORAGE_KEY
          );

        if (!mounted) {
          return;
        }

        if (
          savedLanguage === 'ar' ||
          savedLanguage === 'en' ||
          savedLanguage === 'fr'
        ) {
          setLanguage(savedLanguage);
        }
      } catch (error) {
        console.warn(
          'Failed to load saved language:',
          error
        );
      } finally {
        if (mounted) {
          setIsLoadingLanguage(false);
        }
      }
    };

    loadSavedLanguage();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     Save / Change Language
  ======================================================= */

  const changeLanguage = useCallback(
    async (newLanguage: Language) => {
      if (newLanguage === language) {
        return;
      }

      try {
        if (await isHapticsSupported()) {
          await Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle.Medium
          );
        }
      } catch {
        // Ignore haptic errors.
      }

      setLanguage(newLanguage);

      try {
        await AsyncStorage.setItem(
          LANGUAGE_STORAGE_KEY,
          newLanguage
        );
      } catch (error) {
        console.warn(
          'Failed to save language:',
          error
        );
      }
    },
    [language]
  );

  /* =======================================================
     Filter Change
  ======================================================= */

  const handleFilterChange = useCallback(
    async (newFilter: Filter) => {
      try {
        if (await isHapticsSupported()) {
          await Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle.Light
          );
        }
      } catch {
        // Ignore haptic errors.
      }

      setFilter(newFilter);
    },
    []
  );

  /* =======================================================
     Filters
  ======================================================= */

  const filters = useMemo(
    () => [
      {
        key: 'all' as Filter,
        label: t('all'),
        icon: 'albums-outline',
      },
      {
        key: 'movies' as Filter,
        label: t('movies'),
        icon: 'film-outline',
      },
      {
        key: 'series' as Filter,
        label: t('series'),
        icon: 'tv-outline',
      },
    ],
    [t]
  );

  /* =======================================================
     ALL — Keep all 10 original sections
  ======================================================= */

  const allLists = useMemo<ContentList[]>(
    () => [
      {
        apiUrl: CatalogUrl.trendingMovies,
        title: t('trendingMovies'),
        type: 'movie',
      },
      {
        apiUrl: CatalogUrl.trendingSeries,
        title: t('trendingSeries'),
        type: 'series',
      },
      {
        apiUrl: CatalogUrl.popularMovies,
        title: t('popularMovies'),
        type: 'movie',
      },
      {
        apiUrl: CatalogUrl.popularSeries,
        title: t('popularSeries'),
        type: 'series',
      },
      {
        apiUrl: CatalogUrl.topMovies,
        title: t('topMovies'),
        type: 'movie',
      },
      {
        apiUrl: CatalogUrl.topSeries,
        title: t('topSeries'),
        type: 'series',
      },
      {
        apiUrl: CatalogUrl.nowPlayingMovies,
        title: t('nowPlaying'),
        type: 'movie',
      },
      {
        apiUrl: CatalogUrl.onTheAirTv,
        title: t('onAir'),
        type: 'series',
      },
      {
        apiUrl: CatalogUrl.upcomingMovies,
        title: t('upcoming'),
        type: 'movie',
      },
      {
        apiUrl: CatalogUrl.airingTodayTv,
        title: t('airingToday'),
        type: 'series',
      },
    ],
    [t]
  );

  /* =======================================================
     MOVIES — Keep all original movie categories
  ======================================================= */

  const movieLists = useMemo<ContentList[]>(
    () => [
      {
        apiUrl: CatalogUrl.trendingMovies,
        title: t('trending'),
        type: 'movie',
      },
      {
        apiUrl: CatalogUrl.nowPlayingMovies,
        title: t('nowPlaying'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.action,
        title: t('action'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.adventure,
        title: t('adventure'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.scifi,
        title: t('scifi'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.comedy,
        title: t('comedy'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.family,
        title: t('family'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.animation,
        title: t('animation'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.thriller,
        title: t('thriller'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.crime,
        title: t('crime'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.horror,
        title: t('horror'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.mystery,
        title: t('mystery'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.fantasy,
        title: t('fantasy'),
        type: 'movie',
      },
      {
        apiUrl: MovieGneres.drama,
        title: t('drama'),
        type: 'movie',
      },
    ],
    [t]
  );

  /* =======================================================
     SERIES — Keep all original TV categories
  ======================================================= */

  const seriesLists = useMemo<ContentList[]>(
    () => [
      {
        apiUrl: CatalogUrl.trendingSeries,
        title: t('trending'),
        type: 'series',
      },
      {
        apiUrl: TvGneres.actionAdventure,
        title: t('actionAdventure'),
        type: 'series',
      },
      {
        apiUrl: TvGneres.drama,
        title: t('drama'),
        type: 'series',
      },
      {
        apiUrl: TvGneres.crime,
        title: t('crime'),
        type: 'series',
      },
      {
        apiUrl: TvGneres.comedy,
        title: t('comedy'),
        type: 'series',
      },
      {
        apiUrl: TvGneres.mystery,
        title: t('mystery'),
        type: 'series',
      },
      {
        apiUrl: TvGneres.scifiFantsy,
        title: t('scifiFantasy'),
        type: 'series',
      },
      {
        apiUrl: TvGneres.animation,
        title: t('animation'),
        type: 'series',
      },
      {
        apiUrl: TvGneres.family,
        title: t('family'),
        type: 'series',
      },
      {
        apiUrl: TvGneres.kids,
        title: t('kids'),
        type: 'series',
      },
    ],
    [t]
  );

  /* =======================================================
     Active Lists
  ======================================================= */

  const activeLists = useMemo<ContentList[]>(() => {
    switch (filter) {
      case 'all':
        return allLists;

      case 'movies':
        return movieLists;

      case 'series':
        return seriesLists;

      default:
        return allLists;
    }
  }, [
    filter,
    allLists,
    movieLists,
    seriesLists,
  ]);

  /* =======================================================
     Carousel Navigation
  ======================================================= */

  const handleCarouselItemPress = useCallback(
    (item: any) => {
      const type: ListType =
        item?.type === 'movie'
          ? 'movie'
          : 'series';

      router.push({
        pathname: `/${type}/details`,
        params: {
          moviedbid: item?.moviedbid,
        },
      });
    },
    []
  );

  /* =======================================================
     Language Options
  ======================================================= */

  const languageOptions: {
    key: Language;
    label: string;
    flag: string;
  }[] = [
    {
      key: 'ar',
      label: 'العربية',
      flag: '🇸🇦',
    },
    {
      key: 'en',
      label: 'English',
      flag: '🇬🇧',
    },
    {
      key: 'fr',
      label: 'Français',
      flag: '🇫🇷',
    },
  ];

  /* =======================================================
     Initial Language Loading
  ======================================================= */

  if (isLoadingLanguage) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar />
        <BlurGradientBackground />

        <Text style={styles.loadingText}>
          ...
        </Text>
      </View>
    );
  }

  /* =======================================================
     Render
  ======================================================= */

  return (
    <View
      style={[
        styles.container,
        {
          direction: isRTL ? 'rtl' : 'ltr',
        },
      ]}
    >
      <StatusBar />

      <BlurGradientBackground />

      <ScrollView
        showsVerticalScrollIndicator={false}
        key={`${filter}-${language}`}
        contentContainerStyle={{
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >

        {/* =================================================
            Language Selector
        ================================================= */}

        <View
          style={[
            styles.languageContainer,
            {
              alignItems: 'center',
            },
          ]}
        >
          <View
            style={[
              styles.languageBar,
              {
                flexDirection: isRTL
                  ? 'row-reverse'
                  : 'row',
              },
            ]}
          >
            {languageOptions.map(
              (option, index) => (
                <React.Fragment key={option.key}>
                  <TouchableOpacity
                    onPress={() =>
                      changeLanguage(
                        option.key
                      )
                    }
                    style={[
                      styles.languageItem,
                      language === option.key &&
                        styles.languageItemActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.languageFlag,
                        language ===
                          option.key &&
                          styles.languageFlagActive,
                      ]}
                    >
                      {option.flag}
                    </Text>

                    <Text
                      style={[
                        styles.languageText,
                        language ===
                          option.key &&
                          styles.languageTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>

                  {index <
                    languageOptions.length -
                      1 && (
                    <View
                      style={
                        styles.languageDivider
                      }
                    />
                  )}
                </React.Fragment>
              )
            )}
          </View>
        </View>

        {/* =================================================
            Carousel
        ================================================= */}

        <AppleTVCarousel
          filter={filter}
          onItemPress={
            handleCarouselItemPress
          }
          autoPlay={true}
          autoPlayInterval={6000}
        />

        {/* =================================================
            Content
        ================================================= */}

        <View
          style={[
            styles.contentContainer,
            {
              direction: isRTL
                ? 'rtl'
                : 'ltr',
            },
          ]}
        >

          {/* =================================================
              Filter Buttons
          ================================================= */}

          <View
            style={
              styles.filtersContainer
            }
          >
            <FlatList
              data={filters}
              horizontal
              inverted={isRTL}
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={[
                styles.filterRow,
                {
                  flexDirection: isRTL
                    ? 'row-reverse'
                    : 'row',
                },
              ]}
              keyExtractor={item =>
                item.key
              }
              renderItem={({
                item,
              }) => (
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filter === item.key &&
                      styles.filterButtonActive,
                    {
                      flexDirection:
                        isRTL
                          ? 'row-reverse'
                          : 'row',
                    },
                  ]}
                  onPress={() =>
                    handleFilterChange(
                      item.key
                    )}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      item.icon as any
                    }
                    size={18}
                    color={
                      filter === item.key
                        ? '#000000'
                        : '#8E8E93'
                    }
                    style={{
                      marginLeft: isRTL
                        ? 7
                        : 0,
                      marginRight: isRTL
                        ? 0
                        : 7,
                    }}
                  />

                  <Text
                    style={[
                      styles.filterButtonText,
                      filter ===
                        item.key &&
                        styles.filterButtonTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>

          {/* =================================================
              All Poster Sections
          ================================================= */}

          {activeLists.map(
            (list, index) => (
              <LazyPosterList
                key={`${filter}-${language}-${index}`}
                apiUrl={list.apiUrl}
                title={list.title}
                type={list.type}
                index={index}
              />
            )
          )}
        </View>

        <BottomSpacing space={50} />
      </ScrollView>
    </View>
  );
}

/* =========================================================
   Styles
========================================================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },

  /* =======================================================
     Language
  ======================================================= */

  languageContainer: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 15,
  },

  languageBar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(20,20,20,0.85)',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 6,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  languageItem: {
    minHeight: 38,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  languageItemActive: {
    backgroundColor: '#FFFFFF',
  },

  languageFlag: {
    fontSize: 16,
    marginRight: 6,
  },

  languageFlagActive: {
    opacity: 1,
  },

  languageText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },

  languageTextActive: {
    color: '#000000',
    fontWeight: '700',
  },

  languageDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#333333',
  },

  /* =======================================================
     Filters
  ======================================================= */

  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 5,
  },

  filterRow: {
    paddingHorizontal: 10,
    gap: 12,
  },

  filterButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 22,

    backgroundColor: '#1A1A1A',

    borderWidth: 1,
    borderColor: '#2A2A2A',
  },

  filterButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
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

  /* =======================================================
     Content
  ======================================================= */

  contentContainer: {
    marginTop: 10,
  },
});
