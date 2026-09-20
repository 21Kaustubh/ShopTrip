import { router, useLocalSearchParams } from 'expo-router';



import { useState } from 'react';



import {
  Alert,
  Linking,



  Pressable,



  ScrollView,



  StyleSheet,



  Text,



  TextInput,



  View,
} from 'react-native';



import {
  getCheapestPrice,



  getPricesByBarcode,



  type RetailerPrice,
} from '../services/priceService';



import { useTrip } from '../context/TripContext';



export default function ProductScreen() {



  const params = useLocalSearchParams<{



    barcode?: string;



    productName?: string;



    brand?: string;



    category?: string;



    weight?: string;



    unit?: string;



  }>();



  const {
    addProduct,
    markRetailerOpened,
  } = useTrip();



  const barcode = String(params.barcode ?? '');



  const productName = String(params.productName ?? 'Unknown Product');



  const brand = String(params.brand ?? '');



  const category = String(params.category ?? '');



  const weight = String(params.weight ?? '');



  const unit = String(params.unit ?? '');



  const [storePrice, setStorePrice] = useState('');



  const [prices, setPrices] = useState<RetailerPrice[]>([]);



  const [selectedRetailer, setSelectedRetailer] =



    useState<RetailerPrice | null>(null);



  const [priceCompared, setPriceCompared] = useState(false);



  const [addedToTrip, setAddedToTrip] = useState(false);



  const storePriceNumber = Number(storePrice);



  const cheapestPrice = getCheapestPrice(prices);



  const savings =



    priceCompared &&



    selectedRetailer &&



    storePriceNumber > selectedRetailer.price



      ? storePriceNumber - selectedRetailer.price



      : 0;



  const comparePrices = () => {



    if (



      !storePrice.trim() ||



      Number.isNaN(storePriceNumber) ||



      storePriceNumber <= 0



    ) {



      Alert.alert(



        'Enter Store Price',



        'Please enter the price you see in the physical store.'



      );



      return;



    }



    const result = getPricesByBarcode(barcode);



    setPrices(result);



    setSelectedRetailer(getCheapestPrice(result));



    setPriceCompared(true);



    setAddedToTrip(false);



  };



  const selectRetailer = (retailer: RetailerPrice) => {



    setSelectedRetailer(retailer);



    setAddedToTrip(false);



  };
  const getRetailerSearchUrl = (
    retailer: string,
    product: string
  ) => {
    const query = encodeURIComponent(product.trim());

    const retailerUrls: Record<string, string> = {
      Blinkit: `https://blinkit.com/s/?q=${query}`,
      Zepto: `https://www.zeptonow.com/search?query=${query}`,
      Amazon: `https://www.amazon.in/s?k=${query}`,
      BigBasket: `https://www.bigbasket.com/ps/?q=${query}`,
      Flipkart: `https://www.flipkart.com/search?q=${query}`,
      'Flipkart Minutes': `https://www.flipkart.com/search?q=${query}`,
      Instamart: `https://www.swiggy.com/instamart/search?query=${query}`,
    };

    return retailerUrls[retailer] ?? null;
  };

  const buyFromRetailer = async () => {
    if (!addedToTrip || !selectedRetailer) {
      Alert.alert(
        'Add Product First',
        'Add this product to your shopping trip before buying it.'
      );
      return;
    }

    const retailerUrl = getRetailerSearchUrl(
      selectedRetailer.retailer,
      productName
    );

    if (!retailerUrl) {
      Alert.alert(
        'Retailer Unavailable',
        'We do not have a retailer link for this platform yet.'
      );
      return;
    }

    try {
      const supported = await Linking.canOpenURL(retailerUrl);
      if (!supported) {
        Alert.alert('Unable to Open Retailer', `Could not open ${selectedRetailer.retailer}.`);
        return;
      }
      await Linking.openURL(retailerUrl);
      markRetailerOpened(barcode);
    } catch {
      Alert.alert('Unable to Open Retailer', `Could not open ${selectedRetailer.retailer}.`);
    }
  };




  const addToShoppingTrip = () => {



    if (!priceCompared) {



      Alert.alert(



        'Compare Prices First',



        'Please compare prices before adding this product.'



      );



      return;



    }



    if (!selectedRetailer) {



      Alert.alert(



        'Select a Retailer',



        'Please select where you want to buy this product.'



      );



      return;



    }



    if (addedToTrip) {



      return;



    }



    addProduct({



      id: `${barcode}-${Date.now()}`,



      barcode,



      productName,



      brand,



      category,



      weight,



      unit,



      storePrice: storePriceNumber,



      onlinePrice: selectedRetailer.price,



      cheapestRetailer: selectedRetailer.retailer,



      savings,



      quantity: 1,



      // Retailer tracking



      selectedRetailer: selectedRetailer.retailer,



      purchasedQuantity: 0,



      purchaseStatus: 'RETAILER_SELECTED',



      retailerBuyClicked: false,



      retailerOpenedAt: null,



    });



    setAddedToTrip(true);



  };



  const viewShoppingTrip = () => {



    router.replace('/trip');



  };



  const scanAnotherProduct = () => {



    router.push('/scan');



  };



  return (



    <View style={styles.screen}>



      <View style={styles.header}>



        <Pressable



          style={({ pressed }) => [



            styles.backButton,



            pressed && styles.buttonPressed,



          ]}



          onPress={() => router.replace('/scan')}



          accessibilityRole="button"



          accessibilityLabel="Go back to scanner"



        >



          <Text style={styles.backText}>‹</Text>



        </Pressable>



        <View style={styles.headerCenter}>



          <Text style={styles.headerTitle}>Product Details</Text>



          <Text style={styles.headerSubtitle}>



            ShopTrip Price Comparison



          </Text>



        </View>



        <View style={styles.headerSpacer} />



      </View>



      <ScrollView



        contentContainerStyle={styles.scrollContent}



        showsVerticalScrollIndicator={false}



        keyboardShouldPersistTaps="handled"



      >



        <View style={styles.card}>



          <Text style={styles.sectionLabel}>PRODUCT</Text>



          <Text style={styles.productName}>{productName}</Text>



          {brand ? <Text style={styles.brand}>{brand}</Text> : null}



          <View style={styles.infoRow}>



            {category ? (



              <View style={styles.infoBadge}>



                <Text style={styles.infoBadgeText}>{category}</Text>



              </View>



            ) : null}



            {weight ? (



              <View style={styles.infoBadge}>



                <Text style={styles.infoBadgeText}>



                  {weight} {unit}



                </Text>



              </View>



            ) : null}



          </View>



        </View>



        <View style={styles.card}>



          <Text style={styles.sectionLabel}>BARCODE</Text>



          <Text style={styles.barcode}>{barcode}</Text>



          <Text style={styles.barcodeType}>EAN13</Text>



        </View>



        <View style={styles.card}>



          <View style={styles.sectionHeaderRow}>



            <View>



              <Text style={styles.cardTitle}>Your Store Price</Text>



              <Text style={styles.cardDescription}>



                Enter the price you see in the physical store



              </Text>



            </View>



            <View style={styles.rupeeCircle}>



              <Text style={styles.rupeeText}>₹</Text>



            </View>



          </View>



          <View style={styles.priceInputContainer}>



            <Text style={styles.inputRupee}>₹</Text>



            <TextInput



              style={styles.priceInput}



              value={storePrice}



              onChangeText={(value) => {



                setStorePrice(value);



                setPriceCompared(false);



                setSelectedRetailer(null);



                setAddedToTrip(false);



              }}



              placeholder="0"



              placeholderTextColor="#888"



              keyboardType="decimal-pad"



              returnKeyType="done"



              onSubmitEditing={comparePrices}



            />



          </View>



          <Text style={styles.exampleText}>



            Press Enter / Done to compare prices.



          </Text>



        </View>



        {priceCompared ? (



          <View style={styles.card}>



            <View style={styles.sectionHeaderRow}>



              <View style={styles.comparisonHeaderText}>



                <Text style={styles.cardTitle}>



                  Online Price Comparison



                </Text>



                <Text style={styles.cardDescription}>



                  Current demo prices • Tap a retailer to select it



                </Text>



              </View>



              <Text style={styles.moneyEmoji}>💰</Text>



            </View>



            {prices.length === 0 ? (



              <View style={styles.noPrices}>



                <Text style={styles.noPricesTitle}>



                  No online prices found



                </Text>



                <Text style={styles.noPricesText}>



                  We don't have comparison data for this product yet.



                </Text>



              </View>



            ) : (



              prices.map((item, index) => {



                const isCheapest =



                  cheapestPrice?.retailer === item.retailer &&



                  cheapestPrice?.price === item.price;



                const isSelected =



                  selectedRetailer?.retailer === item.retailer &&



                  selectedRetailer?.price === item.price;



                return (



                  <Pressable



                    key={`${item.retailer}-${index}`}



                    onPress={() => selectRetailer(item)}



                    accessibilityRole="button"



                    accessibilityLabel={`Select ${item.retailer}`}



                    style={({ pressed }) => [



                      styles.retailerRow,



                      index === prices.length - 1 && styles.lastRetailerRow,



                      isSelected && styles.selectedRetailerRow,



                      pressed && styles.buttonPressed,



                    ]}



                  >



                    <View style={styles.retailerLeft}>



                      <View style={styles.retailerNameRow}>



                        <Text style={styles.retailerName}>



                          {item.retailer}



                        </Text>



                        {isSelected ? (



                          <View style={styles.selectedBadge}>



                            <Text style={styles.selectedText}>



                              SELECTED



                            </Text>



                          </View>



                        ) : null}



                        {isCheapest ? (



                          <View style={styles.cheapestBadge}>



                            <Text style={styles.cheapestText}>



                              CHEAPEST



                            </Text>



                          </View>



                        ) : null}



                      </View>



                      <Text style={styles.deliveryTime}>



                        {item.deliveryTime}



                      </Text>



                    </View>



                    <View style={styles.retailerRight}>



                      <Text style={styles.retailerPrice}>



                        ₹{item.price}



                      </Text>



                      <Text style={styles.selectHint}>



                        {isSelected ? 'Selected' : 'Tap to select'}



                      </Text>



                    </View>



                  </Pressable>



                );



              })



            )}



          </View>



        ) : null}



        {priceCompared && selectedRetailer ? (



          <View style={styles.savingsCard}>



            <Text style={styles.savingsEmoji}>🎉</Text>



            <View style={styles.savingsContent}>



              <Text style={styles.savingsLabel}>SELECTED OPTION</Text>



              <Text style={styles.savingsAmount}>



                ₹{savings.toFixed(2)}



              </Text>



              <Text style={styles.savingsDescription}>



                Potential savings with {selectedRetailer.retailer} at ₹



                {selectedRetailer.price}.



              </Text>



            </View>



          </View>



        ) : null}



        {!priceCompared ? (



          <Pressable



            style={({ pressed }) => [



              styles.primaryButton,



              pressed && styles.buttonPressed,



            ]}



            onPress={comparePrices}



            accessibilityRole="button"



            accessibilityLabel="Compare prices"



          >



            <Text style={styles.primaryButtonText}>Compare Prices</Text>



          </Pressable>



        ) : null}



        {priceCompared && !addedToTrip ? (



          <Pressable



            style={({ pressed }) => [



              styles.primaryButton,



              pressed && styles.buttonPressed,



            ]}



            onPress={addToShoppingTrip}



            accessibilityRole="button"



            accessibilityLabel="Add product to shopping trip"



          >



            <Text style={styles.primaryButtonText}>



              🛒 Add to Shopping Trip



            </Text>



          </Pressable>



        ) : null}



        {addedToTrip ? (



          <View style={styles.addedSection}>



            <View style={styles.addedBanner}>



              <Text style={styles.addedBannerText}>



                ✓ Product Added to Shopping Trip



              </Text>



            </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={buyFromRetailer}
                accessibilityRole="button"
                accessibilityLabel={`Buy on ${selectedRetailer?.retailer ?? 'retailer'}`}
              >
                <Text style={styles.primaryButtonText}>
                  🛍️ Buy on {selectedRetailer?.retailer ?? 'Retailer'}
                </Text>
              </Pressable>



            <Pressable



              style={({ pressed }) => [



                styles.primaryButton,



                pressed && styles.buttonPressed,



              ]}



              onPress={viewShoppingTrip}



              accessibilityRole="button"



              accessibilityLabel="View shopping trip"



            >



              <Text style={styles.primaryButtonText}>



                🛒 View Shopping Trip



              </Text>



            </Pressable>



          </View>



        ) : null}



        {addedToTrip ? (



          <View style={styles.continueCard}>



            <Text style={styles.continueEmoji}>📷</Text>



            <Text style={styles.continueTitle}>Continue Shopping</Text>



            <Text style={styles.continueDescription}>



              Scan another product to continue your current shopping trip.



            </Text>



            <Pressable



              style={({ pressed }) => [



                styles.secondaryButton,



                pressed && styles.buttonPressed,



              ]}



              onPress={scanAnotherProduct}



              accessibilityRole="button"



              accessibilityLabel="Scan another product"



            >



              <Text style={styles.secondaryButtonText}>



                📷 Scan Another Product



              </Text>



            </Pressable>



          </View>



        ) : null}



      </ScrollView>



    </View>



  );



}



const styles = StyleSheet.create({



  screen: {



    flex: 1,



    backgroundColor: '#f7f7f8',



  },



  header: {



    height: 72,



    backgroundColor: '#ffffff',



    borderBottomWidth: 1,



    borderBottomColor: '#e5e5e7',



    flexDirection: 'row',



    alignItems: 'center',



    paddingHorizontal: 20,



  },



  backButton: {



    width: 42,



    height: 42,



    borderRadius: 21,



    backgroundColor: '#f0f0f2',



    alignItems: 'center',



    justifyContent: 'center',



  },



  backText: {



    fontSize: 32,



    lineHeight: 34,



    color: '#111217',



    marginTop: -3,



  },



  headerCenter: {



    flex: 1,



    alignItems: 'center',



  },



  headerTitle: {



    fontSize: 18,



    fontWeight: '800',



    color: '#111217',



  },



  headerSubtitle: {



    marginTop: 3,



    fontSize: 11,



    color: '#777982',



  },



  headerSpacer: {



    width: 42,



  },



  scrollContent: {



    padding: 16,



    paddingBottom: 40,



  },



  card: {



    backgroundColor: '#ffffff',



    borderWidth: 1,



    borderColor: '#e1e1e4',



    borderRadius: 16,



    padding: 16,



    marginBottom: 12,



  },



  sectionLabel: {



    fontSize: 10,



    fontWeight: '800',



    color: '#85868d',



    letterSpacing: 1,



    marginBottom: 8,



  },



  productName: {



    fontSize: 23,



    fontWeight: '800',



    color: '#111217',



    lineHeight: 29,



  },



  brand: {



    marginTop: 5,



    fontSize: 14,



    fontWeight: '600',



    color: '#65666d',



  },



  infoRow: {



    flexDirection: 'row',



    gap: 8,



    marginTop: 12,



  },



  infoBadge: {



    backgroundColor: '#f0f0f2',



    paddingHorizontal: 10,



    paddingVertical: 6,



    borderRadius: 8,



  },



  infoBadgeText: {



    fontSize: 11,



    fontWeight: '700',



    color: '#55565d',



  },



  barcode: {



    fontSize: 19,



    fontWeight: '800',



    color: '#111217',



    letterSpacing: 1,



  },



  barcodeType: {



    marginTop: 4,



    fontSize: 10,



    color: '#8a8b91',



    fontWeight: '600',



  },



  sectionHeaderRow: {



    flexDirection: 'row',



    justifyContent: 'space-between',



    alignItems: 'center',



  },



  comparisonHeaderText: {



    flex: 1,



    marginRight: 12,



  },



  cardTitle: {



    fontSize: 16,



    fontWeight: '800',



    color: '#111217',



  },



  cardDescription: {



    marginTop: 4,



    fontSize: 11,



    color: '#777982',



  },



  rupeeCircle: {



    width: 34,



    height: 34,



    borderRadius: 17,



    backgroundColor: '#111217',



    alignItems: 'center',



    justifyContent: 'center',



  },



  rupeeText: {



    color: '#ffffff',



    fontSize: 16,



    fontWeight: '800',



  },



  priceInputContainer: {



    height: 54,



    marginTop: 14,



    borderWidth: 1,



    borderColor: '#d9dade',



    borderRadius: 12,



    backgroundColor: '#f8f8fa',



    flexDirection: 'row',



    alignItems: 'center',



    paddingHorizontal: 12,



  },



  inputRupee: {



    fontSize: 19,



    fontWeight: '800',



    color: '#111217',



  },



  priceInput: {



    flex: 1,



    height: 52,



    marginLeft: 8,



    fontSize: 18,



    fontWeight: '700',



    color: '#111217',



    outlineStyle: 'none',



  } as any,



  exampleText: {



    marginTop: 7,



    fontSize: 10,



    color: '#85868d',



  },



  moneyEmoji: {



    fontSize: 21,



  },



  retailerRow: {



    minHeight: 70,



    borderBottomWidth: 1,



    borderBottomColor: '#ededee',



    flexDirection: 'row',



    alignItems: 'center',



    justifyContent: 'space-between',



    paddingHorizontal: 4,



  },



  selectedRetailerRow: {



    backgroundColor: '#f0f0f2',



    borderRadius: 10,



    paddingHorizontal: 10,



  },



  lastRetailerRow: {



    borderBottomWidth: 0,



  },



  retailerLeft: {



    flex: 1,



  },



  retailerRight: {



    alignItems: 'flex-end',



    marginLeft: 12,



  },



  retailerNameRow: {



    flexDirection: 'row',



    alignItems: 'center',



    gap: 7,



    flexWrap: 'wrap',



  },



  retailerName: {



    fontSize: 13,



    fontWeight: '800',



    color: '#111217',



  },



  selectedBadge: {



    backgroundColor: '#111217',



    paddingHorizontal: 6,



    paddingVertical: 3,



    borderRadius: 5,



  },



  selectedText: {



    fontSize: 7,



    fontWeight: '900',



    color: '#ffffff',



  },



  cheapestBadge: {



    backgroundColor: '#111217',



    paddingHorizontal: 6,



    paddingVertical: 3,



    borderRadius: 5,



  },



  cheapestText: {



    fontSize: 7,



    fontWeight: '900',



    color: '#ffffff',



  },



  deliveryTime: {



    marginTop: 4,



    fontSize: 10,



    color: '#7e7f86',



  },



  retailerPrice: {



    fontSize: 14,



    fontWeight: '800',



    color: '#111217',



  },



  selectHint: {



    marginTop: 3,



    fontSize: 9,



    fontWeight: '700',



    color: '#777982',



  },



  noPrices: {



    paddingVertical: 20,



    alignItems: 'center',



  },



  noPricesTitle: {



    fontSize: 14,



    fontWeight: '800',



    color: '#111217',



  },



  noPricesText: {



    marginTop: 5,



    fontSize: 11,



    color: '#777982',



    textAlign: 'center',



  },



  savingsCard: {



    backgroundColor: '#ffffff',



    borderWidth: 1,



    borderColor: '#e1e1e4',



    borderRadius: 16,



    padding: 16,



    marginBottom: 12,



    flexDirection: 'row',



    alignItems: 'center',



  },



  savingsEmoji: {



    fontSize: 28,



    marginRight: 14,



  },



  savingsContent: {



    flex: 1,



  },



  savingsLabel: {



    fontSize: 9,



    fontWeight: '800',



    color: '#85868d',



    letterSpacing: 1,



  },



  savingsAmount: {



    marginTop: 2,



    fontSize: 22,



    fontWeight: '900',



    color: '#111217',



  },



  savingsDescription: {



    marginTop: 3,



    fontSize: 10,



    color: '#777982',



  },



  primaryButton: {



    minHeight: 52,



    borderRadius: 12,



    backgroundColor: '#111217',



    alignItems: 'center',



    justifyContent: 'center',



    marginBottom: 12,



  },



  primaryButtonText: {



    color: '#ffffff',



    fontSize: 14,



    fontWeight: '800',



  },



  buttonPressed: {



    opacity: 0.7,



    transform: [{ scale: 0.995 }],



  },



  addedSection: {



    marginBottom: 4,



  },



  addedBanner: {



    backgroundColor: '#e9f7ed',



    borderWidth: 1,



    borderColor: '#c9e9d1',



    borderRadius: 12,



    paddingVertical: 12,



    paddingHorizontal: 14,



    alignItems: 'center',



    marginBottom: 10,



  },



  addedBannerText: {



    color: '#20733a',



    fontSize: 13,



    fontWeight: '800',



  },



  continueCard: {



    backgroundColor: '#ffffff',



    borderWidth: 1,



    borderColor: '#e1e1e4',



    borderRadius: 16,



    padding: 16,



    marginTop: 2,



  },



  continueEmoji: {



    fontSize: 25,



    marginBottom: 8,



  },



  continueTitle: {



    fontSize: 17,



    fontWeight: '800',



    color: '#111217',



  },



  continueDescription: {



    marginTop: 5,



    fontSize: 11,



    lineHeight: 17,



    color: '#777982',



  },



  secondaryButton: {



    minHeight: 48,



    borderRadius: 11,



    backgroundColor: '#111217',



    alignItems: 'center',



    justifyContent: 'center',



    marginTop: 14,



  },



  secondaryButtonText: {



    color: '#ffffff',



    fontSize: 13,



    fontWeight: '800',



  },



});
