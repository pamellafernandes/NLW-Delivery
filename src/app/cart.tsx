import { useState } from "react";
import {
  Text,
  View,
  ScrollView,
  Alert,
  Linking,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Header } from "@/components/header";
import { Product } from "@/components/product";
import { ProductCartProps, useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/utils/functions/format-currency";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Feather } from "@expo/vector-icons";
import { LinkButton } from "@/components/link-button";
import { useNavigation } from "expo-router";
import colors from "tailwindcss/colors";

const PHONE_NUMBER = "558599999999";

export default function Cart() {
  const [address, setAddress] = useState("");
  const cartStore = useCartStore();
  const navigation = useNavigation();
  const total = formatCurrency(
    cartStore.products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    )
  );

  function handleProductRemove(product: ProductCartProps) {
    Alert.alert("Remover", `Deseja remover ${product.title} do carrinho?`, [
      { text: "Cancelar" },
      { text: "Remover", onPress: () => cartStore.remove(product.id) },
    ]);
  }

  function handleOrder() {
    if (address.trim().length === 0) {
      return Alert.alert("Pedido", "Informe os dados da entrega.");
    }

    const products = cartStore.products
      .map((product) => `\n ${product.quantity}x ${product.title}`)
      .join("");

    const message = `
    🍔 NOVO PEDIDO
    \n Entregar em: ${address}

    ${products}

    \n Valor total: ${total}
    `;

    Linking.openURL(
      `http://api.whatsapp.com/send?phone=${PHONE_NUMBER}&text${message}`
    );

    cartStore.clear();
    navigation.goBack();
  }

  return (
    <View className="flex-1 pt-8">
      <Header title="Seu Carrinho" />
      <KeyboardAwareScrollView>
        <ScrollView>
          <View className="flex-1 p-5">
            {cartStore.products.length > 0 ? (
              <FlatList
                data={cartStore.products}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View>
                    <Product data={item} />
                    <View className="flex-row items-center w-auto m-2 ml-auto">
                      <TouchableOpacity
                        className="w-8 h-4 items-center justify-center"
                        onPress={() => cartStore.remove(item.id)}
                      >
                        <Feather
                          name="minus"
                          size={16}
                          color={colors.slate[300]}
                        />
                      </TouchableOpacity>
                      <Text className="text-slate-400 text-xs font-subtitle mr-4 text-center mx-auto">
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        className="w-8 h-4 items-center justify-center"
                        onPress={() => cartStore.add(item)}
                      >
                        <Feather
                          name="plus"
                          size={16}
                          color={colors.slate[300]}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                className="border-b border-slate-700"
              />
            ) : (
              <Text className="font-body text-slate-400 text-center my-8">
                Seu carrinho está vazio.
              </Text>
            )}

            <View className="flex-row gap-2 items-center mt-5 mb-4">
              <Text className="text-white text-xl font-subtitle">Total:</Text>
              <Text className="text-lime-400 text-2xl font-heading">
                {total}
              </Text>
            </View>

            <Input
              placeholder="Informe o endereço de entrega com rua, bairro, CEP, número e complemento..."
              onChangeText={setAddress}
              blurOnSubmit={true}
              onSubmitEditing={handleOrder}
              returnKeyType="next"
            />
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
      <View className="p-5 gap-5">
        <Button onPress={handleOrder}>
          <Button.Text>Enviar Pedido</Button.Text>
          <Button.Icon>
            <Feather name="arrow-right-circle" size={20} />
          </Button.Icon>
        </Button>

        <LinkButton title="Voltar ao Cardápio" href="/" />
      </View>
    </View>
  );
}
