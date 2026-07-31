import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@rouge-beauty/products';
const categories = ['Todos', 'Maquiagem', 'Skincare', 'Cabelos', 'Fragrâncias'];
const emptyProduct = { name: '', category: 'Maquiagem', brand: '', price: '', description: '', image: '' };
const starterProducts = [
  { id: '1', name: 'Soft Pinch Liquid Blush', category: 'Maquiagem', brand: 'Rare Beauty', price: '149,90', description: 'Blush líquido de alta pigmentação com acabamento natural e confortável.', image: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a07?auto=format&fit=crop&w=700&q=80' },
  { id: '2', name: 'Advanced Night Repair', category: 'Skincare', brand: 'Estée Lauder', price: '389,00', description: 'Sérum reparador para uma pele mais hidratada, luminosa e uniforme.', image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?auto=format&fit=crop&w=700&q=80' },
  { id: '3', name: 'Eau de Parfum Libre', category: 'Fragrâncias', brand: 'Yves Saint Laurent', price: '579,90', description: 'Uma fragrância floral marcante com lavanda, flor de laranjeira e baunilha.', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=80' },
];

// Normaliza o preço digitado para o formato monetário brasileiro.
const formatPrice = (value) => {
  const digits = value.replace(/[^0-9]/g, '');
  return digits ? (Number(digits) / 100).toFixed(2).replace('.', ',') : '';
};

function Header({ onAdd }) {
  return <View style={styles.header}>
    <View><Text style={styles.eyebrow}>CURADORIA DE BELEZA</Text><Text style={styles.logo}>ROUGE<Text style={styles.red}>.</Text></Text></View>
    <Pressable accessibilityLabel="Adicionar produto" onPress={onAdd} style={styles.addButton}><Text style={styles.addIcon}>+</Text></Pressable>
  </View>;
}

function ProductCard({ product, onEdit, onDelete }) {
  return <View style={styles.card}>
    <Image source={{ uri: product.image }} style={styles.productImage} />
    <View style={styles.productInfo}>
      <Text style={styles.categoryLabel}>{product.category.toUpperCase()}</Text>
      <Text numberOfLines={1} style={styles.productName}>{product.name}</Text>
      <Text style={styles.brand}>{product.brand}</Text>
      <View style={styles.cardBottom}><Text style={styles.price}>R$ {product.price}</Text><View style={styles.actions}>
        <Pressable onPress={() => onEdit(product)} style={styles.action}><Text style={styles.actionText}>Editar</Text></Pressable>
        <Pressable onPress={() => onDelete(product)} style={[styles.action, styles.deleteAction]}><Text style={[styles.actionText, styles.deleteText]}>Excluir</Text></Pressable>
      </View></View>
    </View>
  </View>;
}

function ProductForm({ visible, product, onClose, onSave }) {
  const [form, setForm] = useState(product || emptyProduct);
  const [saving, setSaving] = useState(false);
  const editing = Boolean(product?.id);
  useEffect(() => setForm(product || emptyProduct), [product, visible]);
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async () => {
    if (!form.name.trim() || !form.brand.trim() || !form.price.trim() || !form.image.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, marca, preço e imagem.'); return;
    }
    setSaving(true);
    await onSave({ ...form, name: form.name.trim(), brand: form.brand.trim(), description: form.description.trim() });
    setSaving(false);
  };
  const fields = [['name', 'Nome do produto', 'Ex.: Glow Recipe Watermelon'], ['brand', 'Marca', 'Ex.: Fenty Beauty'], ['price', 'Preço', '0,00'], ['image', 'URL da imagem', 'https://...']];
  return <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modal}>
      <View style={styles.formHeader}><Pressable onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable><Text style={styles.formTitle}>{editing ? 'Editar produto' : 'Novo produto'}</Text><View style={styles.spacer} /></View>
      <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.formIntro}>{editing ? 'Atualize os detalhes da sua curadoria.' : 'Adicione um novo item à sua curadoria.'}</Text>
        {fields.map(([field, label, placeholder]) => <View key={field} style={styles.inputGroup}><Text style={styles.inputLabel}>{label}</Text><TextInput value={form[field]} onChangeText={(value) => update(field, field === 'price' ? formatPrice(value) : value)} placeholder={placeholder} placeholderTextColor="#A39F9B" keyboardType={field === 'price' ? 'decimal-pad' : 'default'} autoCapitalize={field === 'image' ? 'none' : 'sentences'} style={styles.input} /></View>)}
        <Text style={styles.inputLabel}>Categoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryPicker}>{categories.slice(1).map((category) => <Pressable key={category} onPress={() => update('category', category)} style={[styles.formChip, form.category === category && styles.formChipActive]}><Text style={[styles.formChipText, form.category === category && styles.formChipTextActive]}>{category}</Text></Pressable>)}</ScrollView>
        <View style={styles.inputGroup}><Text style={styles.inputLabel}>Descrição</Text><TextInput value={form.description} onChangeText={(value) => update('description', value)} placeholder="Conte um pouco sobre o produto" placeholderTextColor="#A39F9B" multiline style={[styles.input, styles.description]} /></View>
        <Pressable disabled={saving} onPress={submit} style={styles.saveButton}>{saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveText}>{editing ? 'Salvar alterações' : 'Adicionar produto'}</Text>}</Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  </Modal>;
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('Todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    const load = async () => { try { const stored = await AsyncStorage.getItem(STORAGE_KEY); setProducts(stored ? JSON.parse(stored) : starterProducts); } catch { setProducts(starterProducts); } finally { setLoading(false); } };
    load();
  }, []);
  const persist = async (next) => { setProducts(next); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); };
  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'Todos' || product.category === category;
    const query = search.toLowerCase();
    return matchesCategory && (!query || `${product.name} ${product.brand}`.toLowerCase().includes(query));
  }), [products, category, search]);
  const closeForm = () => { setFormVisible(false); setEditing(null); };
  const save = async (form) => { const next = editing ? products.map((item) => item.id === editing.id ? { ...form, id: item.id } : item) : [...products, { ...form, id: Date.now().toString() }]; await persist(next); closeForm(); };
  const remove = (product) => Alert.alert('Excluir produto?', `“${product.name}” será removido da sua curadoria.`, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Excluir', style: 'destructive', onPress: () => persist(products.filter((item) => item.id !== product.id)) }]);

  return <View style={styles.app}><StatusBar barStyle="dark-content" /><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.page}>
    <Header onAdd={() => { setEditing(null); setFormVisible(true); }} />
    <View style={styles.hero}><Text style={styles.heroKicker}>THE EDIT / 2025</Text><Text style={styles.heroTitle}>Sua beleza,<Text style={styles.red}> sua assinatura.</Text></Text><Text style={styles.heroDescription}>Uma seleção pessoal de essenciais para todos os seus rituais.</Text></View>
    <View style={styles.searchBox}><Text style={styles.searchIcon}>⌕</Text><TextInput value={search} onChangeText={setSearch} placeholder="Buscar na sua curadoria" placeholderTextColor="#8E8984" style={styles.searchInput} /></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.chip, category === item && styles.chipActive]}><Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text></Pressable>)}</ScrollView>
    <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Todos os produtos</Text><Text style={styles.sectionCount}>{visibleProducts.length} {visibleProducts.length === 1 ? 'item' : 'itens'} salvos</Text></View><Pressable onPress={() => { setEditing(null); setFormVisible(true); }}><Text style={styles.addLabel}>+ ADICIONAR</Text></Pressable></View>
    {loading ? <ActivityIndicator color="#C62B36" style={styles.loader} /> : visibleProducts.length ? visibleProducts.map((product) => <ProductCard key={product.id} product={product} onEdit={(item) => { setEditing(item); setFormVisible(true); }} onDelete={remove} />) : <View style={styles.empty}><Text style={styles.emptyTitle}>Nada por aqui ainda.</Text><Text style={styles.emptyText}>Tente outra busca ou adicione seu próximo favorito.</Text></View>}
  </ScrollView><ProductForm visible={formVisible} product={editing} onClose={closeForm} onSave={save} /></View>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#F7F5F2' }, page: { padding: 24, paddingTop: 62, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 42 }, eyebrow: { fontSize: 10, letterSpacing: 2, color: '#77716C', marginBottom: 5 }, logo: { fontSize: 26, fontWeight: '800', letterSpacing: 5, color: '#161616' }, red: { color: '#C62B36' }, addButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#151515', alignItems: 'center', justifyContent: 'center' }, addIcon: { color: '#FFF', fontSize: 28, fontWeight: '300', lineHeight: 29 },
  hero: { marginBottom: 28 }, heroKicker: { color: '#C62B36', fontSize: 11, fontWeight: '700', letterSpacing: 1.5, marginBottom: 12 }, heroTitle: { color: '#181818', fontSize: 39, lineHeight: 43, fontWeight: '700', letterSpacing: -1 }, heroDescription: { color: '#77716C', fontSize: 15, lineHeight: 22, marginTop: 14, maxWidth: 280 },
  searchBox: { height: 52, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E6E1DC', borderRadius: 4, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 18 }, searchIcon: { fontSize: 25, color: '#55504B', marginRight: 8 }, searchInput: { flex: 1, fontSize: 14, color: '#181818' }, chips: { gap: 8, paddingBottom: 34 }, chip: { borderWidth: 1, borderColor: '#DDD7D1', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20 }, chipActive: { backgroundColor: '#181818', borderColor: '#181818' }, chipText: { fontSize: 12, color: '#6E6863' }, chipTextActive: { color: '#FFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 }, sectionTitle: { fontSize: 21, fontWeight: '700', color: '#181818' }, sectionCount: { fontSize: 12, color: '#89837D', marginTop: 4 }, addLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: '#C62B36' },
  card: { backgroundColor: '#FFF', borderRadius: 5, marginBottom: 14, overflow: 'hidden', flexDirection: 'row', minHeight: 146 }, productImage: { width: 124, minHeight: 146, backgroundColor: '#E9E1DB' }, productInfo: { flex: 1, padding: 16, justifyContent: 'space-between' }, categoryLabel: { fontSize: 9, color: '#C62B36', fontWeight: '700', letterSpacing: 1.2 }, productName: { fontSize: 16, color: '#181818', fontWeight: '600', marginTop: 7 }, brand: { color: '#89837D', fontSize: 12, marginTop: 3 }, cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }, price: { fontSize: 15, fontWeight: '700', color: '#181818' }, actions: { flexDirection: 'row', gap: 5 }, action: { paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: '#E0DAD5', borderRadius: 3 }, deleteAction: { borderColor: '#E8C5C7' }, actionText: { color: '#5F5A55', fontSize: 10, fontWeight: '600' }, deleteText: { color: '#C62B36' }, loader: { marginTop: 45 }, empty: { alignItems: 'center', paddingVertical: 60 }, emptyTitle: { fontSize: 18, fontWeight: '700', color: '#181818' }, emptyText: { marginTop: 8, color: '#89837D', textAlign: 'center' },
  modal: { flex: 1, backgroundColor: '#F7F5F2' }, formHeader: { paddingTop: 58, paddingHorizontal: 24, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#E6E1DC' }, close: { width: 36 }, closeText: { fontSize: 30, color: '#181818', fontWeight: '300' }, formTitle: { fontSize: 18, fontWeight: '700', color: '#181818' }, spacer: { width: 36 }, formContent: { padding: 24, paddingBottom: 50 }, formIntro: { fontSize: 15, color: '#77716C', marginBottom: 28 }, inputGroup: { marginBottom: 20 }, inputLabel: { fontSize: 11, color: '#55504B', letterSpacing: 0.8, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }, input: { height: 48, backgroundColor: '#FFF', borderColor: '#E0DAD5', borderWidth: 1, borderRadius: 4, paddingHorizontal: 14, fontSize: 14, color: '#181818' }, description: { height: 100, paddingTop: 14, textAlignVertical: 'top' }, categoryPicker: { gap: 8, paddingTop: 3, paddingBottom: 24 }, formChip: { borderWidth: 1, borderColor: '#DDD7D1', borderRadius: 18, paddingHorizontal: 13, paddingVertical: 9 }, formChipActive: { backgroundColor: '#C62B36', borderColor: '#C62B36' }, formChipText: { color: '#6E6863', fontSize: 12 }, formChipTextActive: { color: '#FFF' }, saveButton: { height: 52, backgroundColor: '#C62B36', alignItems: 'center', justifyContent: 'center', borderRadius: 4, marginTop: 8 }, saveText: { color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.3 },
});
