 # read raw admission data from its current location
 admission <- read_csv("C:/Users/Mai/Dropbox/Leeds/Qualdash related/Data/admission.csv")

 # break it into separate files for individual years
 # and store the new files in the picanet folder under documnt root 
 for(year in unique(admission$adyear)){
     tmp = subset(admission, adyear == year)
     fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_admission/', gsub(' ','', year), '.csv', sep='' )
     write.csv(tmp, fn, row.names = FALSE)
 }

 # read raw activity data
  activity <- read_csv("C:/Users/Mai/Dropbox/Leeds/Qualdash related/Data/activity.csv")

  # split activity file by year of admission
  myvars <- c("adyear", "eventidscr")
  newdata <- admission[myvars]
  df <- merge(newdata, activity, by='eventidscr')
   for(year in unique(df$adyear)){
     tmp = subset(df, adyear == year)
     fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_activity/', gsub(' ','', year), '.csv', sep='' )
     write.csv(tmp, fn, row.names = FALSE)
 }

 # get the latest year in your data
 maxyear <- max(admission$adyear, na.rm = TRUE)

 # read the admission records for the latest year alone
 fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_admission/', gsub(' ','', maxyear), '.csv', sep='' )
 latest_adm <- read.csv(fn)

 # read the activity records for the latest year alone
fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_activity/', gsub(' ','', maxyear), '.csv', sep='' )
 latest_activ <- read.csv(fn)

 # merge the two files
 M <- merge(latest_adm, latest_activ, by=c('eventidscr'), all.x=T)

 # select only relevant columns for QualDash
 d = data.frame(M$eventidscr, M$addate, M$hrggroup, M$unplannedextubation.y, M$invventet, M$invventtt, M$intubation, M$ventilationstatus, M$avsjet, M$avsosc, M$siteidscr)
 colnames(d) <- c('eventidscr', 'addate', 'hrggroup', 'unplannedextubation', 'invventet', 'invventtt', 'intubation', 'ventiliationstatus', 'avsjet', 'avsosc', 'siteidscr')

  fn = paste('C:/Bitnami/wampstack-7.0.12-0/apache2/htdocs/Qualdashv1/home/data/picanet_activity/shortactiv', gsub(' ','', maxyear), '.csv', sep='' )
  write.csv(d, fn)