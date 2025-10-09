(12) ['/img/goldilocks-teaser.jpg', '/img/jack-teaser.jpg', '/img/snowwhite-teaser.jpg', '/img/beerPongWicked.jpg', '/img/costumes/Cinderella.jpg', '/img/costumes/LittleRedRidingHood.png', '/img/costumes/Pinocchio.png', '/img/costumes/snow-white.png', '/img/costumes/hanselGetel.png', '/img/goldilocks-thumb.jpg', '/img/jack-thumb.jpg', '/img/snowwhite-thumb.jpg']
2MultiPreviewCarousel.tsx:43 [MultiPreviewCarousel] Generating URLs for category: all
2MultiPreviewCarousel.tsx:43 [MultiPreviewCarousel] Generating URLs for category: all
react-dom_client.js?v=e5491b88:7001 TypeError: Failed to fetch dynamically imported module: http://localhost:8080/src/pages/Feast.tsx?t=1759965567987

The above error occurred in the <Route> component.

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.

defaultOnCaughtError @ react-dom_client.js?v=e5491b88:7001
logCaughtError @ react-dom_client.js?v=e5491b88:7033
runWithFiberInDEV @ react-dom_client.js?v=e5491b88:997
inst.componentDidCatch.update.callback @ react-dom_client.js?v=e5491b88:7078
callCallback @ react-dom_client.js?v=e5491b88:5491
commitCallbacks @ react-dom_client.js?v=e5491b88:5503
runWithFiberInDEV @ react-dom_client.js?v=e5491b88:997
commitClassCallbacks @ react-dom_client.js?v=e5491b88:9490
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9958
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9992
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9963
flushLayoutEffects @ react-dom_client.js?v=e5491b88:12924
commitRoot @ react-dom_client.js?v=e5491b88:12803
commitRootWhenReady @ react-dom_client.js?v=e5491b88:12016
performWorkOnRoot @ react-dom_client.js?v=e5491b88:11950
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=e5491b88:13505
performWorkUntilDeadline @ react-dom_client.js?v=e5491b88:36Understand this error
ErrorBoundary.tsx:14 Error caught by boundary: TypeError: Failed to fetch dynamically imported module: http://localhost:8080/src/pages/Feast.tsx?t=1759965567987 {componentStack: '\n    at RenderedRoute (http://localhost:8080/node_…ry.js?v=e5491b88:3022:3)\n    at App (<anonymous>)'}componentStack: "\n    at RenderedRoute (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=e5491b88:4088:5)\n    at Routes (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=e5491b88:4558:5)\n    at Suspense (<anonymous>)\n    at ErrorBoundary (http://localhost:8080/src/components/ErrorBoundary.tsx:83:9)\n    at SwipeNavigator (http://localhost:8080/src/components/SwipeNavigator.tsx:38:34)\n    at main (<anonymous>)\n    at AudioProvider (http://localhost:8080/src/contexts/AudioContext.tsx:25:33)\n    at Router (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=e5491b88:4501:15)\n    at BrowserRouter (http://localhost:8080/node_modules/.vite/deps/react-router-dom.js?v=e5491b88:5247:5)\n    at HuntProvider (http://localhost:8080/src/components/hunt/HuntProvider.tsx:26:32)\n    at AdminProvider (http://localhost:8080/src/contexts/AdminContext.tsx:26:33)\n    at AuthProvider (http://localhost:8080/src/lib/auth.tsx:26:32)\n    at QueryClientProvider (http://localhost:8080/node_modules/.vite/deps/@tanstack_react-query.js?v=e5491b88:3022:3)\n    at App (<anonymous>)"[[Prototype]]: Objectconstructor: ƒ Object()hasOwnProperty: ƒ hasOwnProperty()isPrototypeOf: ƒ isPrototypeOf()propertyIsEnumerable: ƒ propertyIsEnumerable()toLocaleString: ƒ toLocaleString()toString: ƒ toString()valueOf: ƒ valueOf()__defineGetter__: ƒ __defineGetter__()__defineSetter__: ƒ __defineSetter__()__lookupGetter__: ƒ __lookupGetter__()__lookupSetter__: ƒ __lookupSetter__()__proto__: (...)get __proto__: ƒ __proto__()set __proto__: ƒ __proto__()
componentDidCatch @ ErrorBoundary.tsx:14
react_stack_bottom_frame @ react-dom_client.js?v=e5491b88:18547
inst.componentDidCatch.update.callback @ react-dom_client.js?v=e5491b88:7086
callCallback @ react-dom_client.js?v=e5491b88:5491
commitCallbacks @ react-dom_client.js?v=e5491b88:5503
runWithFiberInDEV @ react-dom_client.js?v=e5491b88:997
commitClassCallbacks @ react-dom_client.js?v=e5491b88:9490
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9958
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9992
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9903
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:10074
recursivelyTraverseLayoutEffects @ react-dom_client.js?v=e5491b88:10792
commitLayoutEffectOnFiber @ react-dom_client.js?v=e5491b88:9963
flushLayoutEffects @ react-dom_client.js?v=e5491b88:12924
commitRoot @ react-dom_client.js?v=e5491b88:12803
commitRootWhenReady @ react-dom_client.js?v=e5491b88:12016
performWorkOnRoot @ react-dom_client.js?v=e5491b88:11950
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=e5491b88:13505
performWorkUntilDeadline @ react-dom_client.js?v=e5491b88:36Understand this error
MultiPreviewCarousel.tsx:75 [MultiPreviewCarousel] Final URLs: (37) ['https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OH0.z2qcsVRkA1Un0Q5O2MCQO9Yx39A5aipp4s_3kL5ZFhA', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.SIRaORSYr2lI3dB-E_JPOlQjKlW-lYsqRNo6lXNwBO4', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.Zqxl-5sLbU8wCW8UBi7CmiKC3DECNgQ9MTkrpr_IagE', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.sVUTMLiFcmMClsxsCv652TlpfNmYRbOBSQiAaKQyddY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.A8Xq8VmjRbZcKkIw_-suJjFTv0RH_IQ4V9BtwtAXzDU', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.LeFpnM-ko7XR-3QvRniMg0gII1mVyqRLgKSpbgWQb6k', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.jrC8b0Tf3yHK25lwoSFw0V23C1mrOFi7KbQnVw15o00', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…DAwfQ.pJtbcsMf06_HVvyrMNixmjUed1o7hUURru9Ih938L9c', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.u1_GhLBZpESqa2OSQeXQrjOt2YfUip0u3pf7qnMCuko', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.WAFR2pBe37HcPfTXxEpihK4Np3OYPkpWjRFuRyaIIFY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.7rR0g5tfs2M8MbRybUMvXD7PHohwNj8YpWDE8cdpKwg', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.Ssjud6L8mU4FwT037GXQKrU54FsewXnEpLMxOHDB7Fw', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.916ZkuUhXsDe9uv6CPRl0YvNpKzN0ViU-I5rJfo-ikQ', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.5qrSwKPV18nQxNnUXT0PgPujjn52dyjoU79x_yA_j7g', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0._78IDfq_h_1GUk4ejNT71bJOetb7IqBZJLgpyuYGQCU', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.URbr7ON8I4tYoRD2jptJn0_ApbO2GlUni6VLXRnQZDY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.lVQXs-p-H9fbS54mPgQgiGrqMATvr2B-MTQADDCshb4', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.pHD0q7zEQhoY8ey9BuVNj8-HZYoCUx2ILPVXuOvKgzo', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.u8EmBl7oXW9JjhoIXulqbc52bLYYy23evIU-Lw0Ku0A', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.gvmVwttgTsWnuyfAeeTIK6WQHLoBbdOeYySS2jJ2hss', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.0GgUM8GIgwjwaGJ-f68vvisuiZwkEmrEAnho7c7MBlA', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.298tM3kp_Ii0ecCPXw9ml6nGA0xkC0VIX6yTRN3mskI', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.a8ah8O1V_-oTelgNVrhIdrnIDwcZi33yHy2_BHSJxM0', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…wMDF9.B2jkk_ZqW6IPQr2qH-xnDTTVBRI8cDn5_a-fc0so-mM', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.8y1eWJgomVM6RXiKt7Ia_iFj6otay3MrW2Ui9EetSTk', '/img/goldilocks-teaser.jpg', '/img/jack-teaser.jpg', '/img/snowwhite-teaser.jpg', '/img/beerPongWicked.jpg', '/img/costumes/Cinderella.jpg', '/img/costumes/LittleRedRidingHood.png', '/img/costumes/Pinocchio.png', '/img/costumes/snow-white.png', '/img/costumes/hanselGetel.png', '/img/goldilocks-thumb.jpg', '/img/jack-thumb.jpg', '/img/snowwhite-thumb.jpg']
MultiPreviewCarousel.tsx:75 [MultiPreviewCarousel] Final URLs: (37) ['https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OH0.z2qcsVRkA1Un0Q5O2MCQO9Yx39A5aipp4s_3kL5ZFhA', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.SIRaORSYr2lI3dB-E_JPOlQjKlW-lYsqRNo6lXNwBO4', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.Zqxl-5sLbU8wCW8UBi7CmiKC3DECNgQ9MTkrpr_IagE', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.sVUTMLiFcmMClsxsCv652TlpfNmYRbOBSQiAaKQyddY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.A8Xq8VmjRbZcKkIw_-suJjFTv0RH_IQ4V9BtwtAXzDU', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.wzALY2M21yQktoiawlehuwR0-gwKqHA6fFcFbJ2lJ_w', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.jrC8b0Tf3yHK25lwoSFw0V23C1mrOFi7KbQnVw15o00', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…DAwfQ.pJtbcsMf06_HVvyrMNixmjUed1o7hUURru9Ih938L9c', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.u1_GhLBZpESqa2OSQeXQrjOt2YfUip0u3pf7qnMCuko', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.WAFR2pBe37HcPfTXxEpihK4Np3OYPkpWjRFuRyaIIFY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.7rR0g5tfs2M8MbRybUMvXD7PHohwNj8YpWDE8cdpKwg', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.Ssjud6L8mU4FwT037GXQKrU54FsewXnEpLMxOHDB7Fw', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.916ZkuUhXsDe9uv6CPRl0YvNpKzN0ViU-I5rJfo-ikQ', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.5qrSwKPV18nQxNnUXT0PgPujjn52dyjoU79x_yA_j7g', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0._78IDfq_h_1GUk4ejNT71bJOetb7IqBZJLgpyuYGQCU', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.URbr7ON8I4tYoRD2jptJn0_ApbO2GlUni6VLXRnQZDY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.JwYyrOP1ozx4eXa3LxkkKO0p9bwB319LpxKoJmBaoNU', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.pHD0q7zEQhoY8ey9BuVNj8-HZYoCUx2ILPVXuOvKgzo', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.u8EmBl7oXW9JjhoIXulqbc52bLYYy23evIU-Lw0Ku0A', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.gvmVwttgTsWnuyfAeeTIK6WQHLoBbdOeYySS2jJ2hss', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.0GgUM8GIgwjwaGJ-f68vvisuiZwkEmrEAnho7c7MBlA', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.298tM3kp_Ii0ecCPXw9ml6nGA0xkC0VIX6yTRN3mskI', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.a8ah8O1V_-oTelgNVrhIdrnIDwcZi33yHy2_BHSJxM0', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…wMDF9.B2jkk_ZqW6IPQr2qH-xnDTTVBRI8cDn5_a-fc0so-mM', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.8y1eWJgomVM6RXiKt7Ia_iFj6otay3MrW2Ui9EetSTk', '/img/goldilocks-teaser.jpg', '/img/jack-teaser.jpg', '/img/snowwhite-teaser.jpg', '/img/beerPongWicked.jpg', '/img/costumes/Cinderella.jpg', '/img/costumes/LittleRedRidingHood.png', '/img/costumes/Pinocchio.png', '/img/costumes/snow-white.png', '/img/costumes/hanselGetel.png', '/img/goldilocks-thumb.jpg', '/img/jack-thumb.jpg', '/img/snowwhite-thumb.jpg']
MultiPreviewCarousel.tsx:75 [MultiPreviewCarousel] Final URLs: (37) ['https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OH0.z2qcsVRkA1Un0Q5O2MCQO9Yx39A5aipp4s_3kL5ZFhA', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.SIRaORSYr2lI3dB-E_JPOlQjKlW-lYsqRNo6lXNwBO4', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.Zqxl-5sLbU8wCW8UBi7CmiKC3DECNgQ9MTkrpr_IagE', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.sVUTMLiFcmMClsxsCv652TlpfNmYRbOBSQiAaKQyddY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.pZET-Kj2hdC02Q8FnDXGJrOXl6x9wOfIVm0I3r8tzbs', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.wzALY2M21yQktoiawlehuwR0-gwKqHA6fFcFbJ2lJ_w', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.jrC8b0Tf3yHK25lwoSFw0V23C1mrOFi7KbQnVw15o00', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…DAwfQ.pJtbcsMf06_HVvyrMNixmjUed1o7hUURru9Ih938L9c', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.u1_GhLBZpESqa2OSQeXQrjOt2YfUip0u3pf7qnMCuko', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.WAFR2pBe37HcPfTXxEpihK4Np3OYPkpWjRFuRyaIIFY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.7rR0g5tfs2M8MbRybUMvXD7PHohwNj8YpWDE8cdpKwg', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.Ssjud6L8mU4FwT037GXQKrU54FsewXnEpLMxOHDB7Fw', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.916ZkuUhXsDe9uv6CPRl0YvNpKzN0ViU-I5rJfo-ikQ', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.5qrSwKPV18nQxNnUXT0PgPujjn52dyjoU79x_yA_j7g', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0._78IDfq_h_1GUk4ejNT71bJOetb7IqBZJLgpyuYGQCU', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.URbr7ON8I4tYoRD2jptJn0_ApbO2GlUni6VLXRnQZDY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.JwYyrOP1ozx4eXa3LxkkKO0p9bwB319LpxKoJmBaoNU', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.pHD0q7zEQhoY8ey9BuVNj8-HZYoCUx2ILPVXuOvKgzo', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.u8EmBl7oXW9JjhoIXulqbc52bLYYy23evIU-Lw0Ku0A', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.gvmVwttgTsWnuyfAeeTIK6WQHLoBbdOeYySS2jJ2hss', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.0GgUM8GIgwjwaGJ-f68vvisuiZwkEmrEAnho7c7MBlA', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.298tM3kp_Ii0ecCPXw9ml6nGA0xkC0VIX6yTRN3mskI', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.a8ah8O1V_-oTelgNVrhIdrnIDwcZi33yHy2_BHSJxM0', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…wMDF9.B2jkk_ZqW6IPQr2qH-xnDTTVBRI8cDn5_a-fc0so-mM', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.8y1eWJgomVM6RXiKt7Ia_iFj6otay3MrW2Ui9EetSTk', '/img/goldilocks-teaser.jpg', '/img/jack-teaser.jpg', '/img/snowwhite-teaser.jpg', '/img/beerPongWicked.jpg', '/img/costumes/Cinderella.jpg', '/img/costumes/LittleRedRidingHood.png', '/img/costumes/Pinocchio.png', '/img/costumes/snow-white.png', '/img/costumes/hanselGetel.png', '/img/goldilocks-thumb.jpg', '/img/jack-thumb.jpg', '/img/snowwhite-thumb.jpg']
MultiPreviewCarousel.tsx:75 [MultiPreviewCarousel] Final URLs: (37) ['https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.ouOnvsz_S8Oc4HKo5eZERIRv31UnW1gJOu9nUqoDUoM', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.SIRaORSYr2lI3dB-E_JPOlQjKlW-lYsqRNo6lXNwBO4', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.Zqxl-5sLbU8wCW8UBi7CmiKC3DECNgQ9MTkrpr_IagE', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…k5OX0.sVUTMLiFcmMClsxsCv652TlpfNmYRbOBSQiAaKQyddY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.pZET-Kj2hdC02Q8FnDXGJrOXl6x9wOfIVm0I3r8tzbs', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.wzALY2M21yQktoiawlehuwR0-gwKqHA6fFcFbJ2lJ_w', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.jrC8b0Tf3yHK25lwoSFw0V23C1mrOFi7KbQnVw15o00', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…DAwfQ.pJtbcsMf06_HVvyrMNixmjUed1o7hUURru9Ih938L9c', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.u1_GhLBZpESqa2OSQeXQrjOt2YfUip0u3pf7qnMCuko', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.WAFR2pBe37HcPfTXxEpihK4Np3OYPkpWjRFuRyaIIFY', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.7rR0g5tfs2M8MbRybUMvXD7PHohwNj8YpWDE8cdpKwg', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.Ssjud6L8mU4FwT037GXQKrU54FsewXnEpLMxOHDB7Fw', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.916ZkuUhXsDe9uv6CPRl0YvNpKzN0ViU-I5rJfo-ikQ', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMH0.5qrSwKPV18nQxNnUXT0PgPujjn52dyjoU79x_yA_j7g', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.TRcvWV781Mx8xSeT3UoG1s1tsim13mfktzwaxBi_i6M', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.ziHoKmo5ndYuKRzy-ciol74JXZBptdTT88zWRgFw6og', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.JwYyrOP1ozx4eXa3LxkkKO0p9bwB319LpxKoJmBaoNU', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.pHD0q7zEQhoY8ey9BuVNj8-HZYoCUx2ILPVXuOvKgzo', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.u8EmBl7oXW9JjhoIXulqbc52bLYYy23evIU-Lw0Ku0A', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.gvmVwttgTsWnuyfAeeTIK6WQHLoBbdOeYySS2jJ2hss', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.0GgUM8GIgwjwaGJ-f68vvisuiZwkEmrEAnho7c7MBlA', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.298tM3kp_Ii0ecCPXw9ml6nGA0xkC0VIX6yTRN3mskI', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMX0.a8ah8O1V_-oTelgNVrhIdrnIDwcZi33yHy2_BHSJxM0', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…wMDF9.B2jkk_ZqW6IPQr2qH-xnDTTVBRI8cDn5_a-fc0so-mM', 'https://dgdeiybuxlqbdfofzxpy.supabase.co/storage/v…AwMn0.nYs0i_AoQmuZ2j0SxjBI0gro-9jvCgpJXdfanQdtOHk', '/img/goldilocks-teaser.jpg', '/img/jack-teaser.jpg', '/img/snowwhite-teaser.jpg', '/img/beerPongWicked.jpg', '/img/costumes/Cinderella.jpg', '/img/costumes/LittleRedRidingHood.png', '/img/costumes/Pinocchio.png', '/img/costumes/snow-white.png', '/img/costumes/hanselGetel.png', '/img/goldilocks-thumb.jpg', '/img/jack-thumb.jpg', '/img/snowwhite-thumb.jpg']